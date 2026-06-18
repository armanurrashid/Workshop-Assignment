import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface PasswordEntry {
  id: number;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

interface PasswordCardProps {
  entry: PasswordEntry;
  onDelete: (id: number) => void;
}

export default function PasswordCard({ entry, onDelete }: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCopy = async () => {
    try {
      await invoke("plugin:clipboard-manager|write_text", { text: entry.password });
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        // Clear clipboard after 30 seconds
        invoke("plugin:clipboard-manager|write_text", { text: "" }).catch(() => {});
      }, 30000);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback to navigator clipboard
      await navigator.clipboard.writeText(entry.password);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        navigator.clipboard.writeText("").catch(() => {});
      }, 30000);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(entry.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const domain = entry.url
    ? (() => {
        try {
          return new URL(entry.url.startsWith("http") ? entry.url : `https://${entry.url}`).hostname;
        } catch {
          return entry.url;
        }
      })()
    : null;

  return (
    <div className="group bg-[#1a1a1a] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all duration-200">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-400 text-xs font-semibold uppercase">
              {entry.title.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{entry.title}</p>
            {domain && <p className="text-xs text-neutral-500 truncate">{domain}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            title="Copy password"
            className={`p-1.5 rounded-lg transition-colors ${
              copied
                ? "text-green-400 bg-green-400/10"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {copied ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {showPassword ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>

          <button
            onClick={handleDelete}
            title={confirmDelete ? "Click again to confirm" : "Delete entry"}
            className={`p-1.5 rounded-lg transition-colors ${
              confirmDelete
                ? "text-red-400 bg-red-400/10"
                : "text-neutral-400 hover:text-red-400 hover:bg-red-400/5"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5">
        {entry.username && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 w-16 flex-shrink-0">User</span>
            <span className="text-xs text-neutral-300 truncate">{entry.username}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 w-16 flex-shrink-0">Password</span>
          <span className="text-xs text-neutral-300 font-mono truncate">
            {showPassword ? entry.password : "••••••••••••"}
          </span>
        </div>
        {entry.notes && (
          <div className="flex items-start gap-2 mt-2 pt-2 border-t border-white/5">
            <span className="text-xs text-neutral-500 w-16 flex-shrink-0 pt-0.5">Notes</span>
            <span className="text-xs text-neutral-400 line-clamp-2">{entry.notes}</span>
          </div>
        )}
      </div>

      {confirmDelete && (
        <p className="text-xs text-red-400 mt-2">Click delete again to confirm</p>
      )}
    </div>
  );
}
