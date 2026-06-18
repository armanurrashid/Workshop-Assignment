import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PasswordCard from "../components/PasswordCard";
import AddPasswordModal from "../components/AddPasswordModal";

interface PasswordEntry {
  id: number;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadPasswords = async () => {
    try {
      const data = await invoke<PasswordEntry[]>("get_passwords");
      setEntries(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasswords();
  }, []);

  // Auto-lock on window blur
  useEffect(() => {
    const handleBlur = () => {
      invoke("logout").catch(() => {});
      onLogout();
      navigate("/login");
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [navigate, onLogout]);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const handleDelete = async (id: number) => {
    try {
      await invoke("delete_password_entry", { id });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(String(err));
    }
  };

  const handleSaved = () => {
    setShowModal(false);
    loadPasswords();
  };

  const filtered = entries.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.username.toLowerCase().includes(search.toLowerCase()) ||
      e.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] overflow-hidden">
      <Header onLogout={handleLogout} />

      {/* Search */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vault…"
            className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/30 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            {search ? (
              <>
                <p className="text-sm text-neutral-400">No results for "{search}"</p>
                <button onClick={() => setSearch("")} className="text-xs text-indigo-400 mt-2 hover:underline">
                  Clear search
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <p className="text-sm text-neutral-400 font-medium">Your vault is empty</p>
                <p className="text-xs text-neutral-600 mt-1">Click + to add your first password</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-neutral-500">
                {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
                {search && ` for "${search}"`}
              </p>
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {filtered.map((entry) => (
                <PasswordCard key={entry.id} entry={entry} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Add password"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {showModal && (
        <AddPasswordModal onSave={handleSaved} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
