# AGENTS.md

Global rules and conventions for AI agents working in this repository.

---

## Project Overview

A secure, offline desktop password manager built with Tauri 2 (Rust backend) and React + TypeScript (frontend). Users register with a master password, all stored credentials are encrypted with AES-256-GCM, and the master password is hashed with Argon2id. The app is a single-user, local-only vault — no cloud sync, no network calls.

See `PRD.md` for full product requirements.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Tauri 2 | Desktop app shell, IPC bridge between Rust and frontend |
| Rust (stable) | Backend logic: crypto, database, Tauri commands |
| React 18 + TypeScript | Frontend UI |
| Vite 5 | Frontend build tool and dev server |
| Tailwind CSS 3 | Utility-first styling |
| react-router-dom v6 | Client-side routing between Register/Login/Dashboard |
| SQLite (rusqlite) | Local encrypted vault database |
| argon2 (Rust crate) | Master password hashing (Argon2id) |
| aes-gcm (Rust crate) | AES-256-GCM encryption for stored passwords |
| serde + serde_json | Rust serialization for Tauri command payloads |

---

## Commands

```bash
# Install frontend dependencies
npm install

# Run in dev mode (hot-reload frontend + Rust backend)
npm run tauri dev

# Build production binary
npm run tauri build

# Type-check frontend only
npm run type-check

# Lint frontend
npm run lint
```

**Rust-only (from src-tauri/):**
```bash
cargo check          # Fast compile check
cargo clippy         # Lint
cargo test           # Run unit tests
```

---

## Project Structure

```
.
├── PRD.md                      # Product requirements
├── AGENTS.md                   # This file
├── index.html                  # Vite entry point
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
│
├── src/                        # React frontend
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Router setup
│   ├── index.css               # Tailwind base styles
│   ├── pages/
│   │   ├── Register.tsx        # First-run registration screen
│   │   ├── Login.tsx           # Login screen
│   │   └── Dashboard.tsx       # Vault dashboard
│   └── components/
│       ├── Header.tsx          # Top bar with logout
│       ├── PasswordCard.tsx    # Single vault entry card
│       └── AddPasswordModal.tsx # Add/edit password form
│
└── src-tauri/                  # Rust/Tauri backend
    ├── Cargo.toml
    ├── tauri.conf.json
    ├── build.rs
    └── src/
        ├── main.rs             # Tauri app setup, command registration
        ├── commands.rs         # All #[tauri::command] handlers
        ├── crypto.rs           # Argon2 hashing + AES-256-GCM encrypt/decrypt
        ├── db.rs               # SQLite schema creation and CRUD
        └── models.rs           # Rust structs (User, PasswordEntry, etc.)
```

---

## Architecture

**Data flow for login:**
```
User types master password
  → Frontend calls invoke("login", { password })
  → commands.rs: hash input, compare with stored hash in DB
  → On match: derive 256-bit key from password, store in app State
  → Return success to frontend
  → React Router navigates to /dashboard
```

**Data flow for saving a password:**
```
User fills Add Password form
  → Frontend calls invoke("add_password", { entry })
  → commands.rs: retrieve key from State, encrypt password field with AES-256-GCM
  → db.rs: INSERT ciphertext + nonce into SQLite
  → Return new entry id to frontend
```

**Tauri State:** The derived encryption key is held in `tauri::State<Mutex<Option<[u8; 32]>>>` after login and cleared on logout/lock.

---

## Code Patterns

### Naming Conventions
- Rust: `snake_case` for functions/variables, `PascalCase` for structs/enums
- TypeScript: `camelCase` for variables/functions, `PascalCase` for components/types
- Tauri commands: `snake_case` names in Rust, called via `invoke("snake_case_name")` in TS
- CSS: Tailwind utility classes only — no custom CSS classes except in `index.css` for base styles

### Rust Tauri Commands Pattern
```rust
#[tauri::command]
fn command_name(
    param: String,
    state: tauri::State<'_, AppState>,
) -> Result<ReturnType, String> {
    // always return Result<T, String> — errors become rejected JS promises
}
```

### Frontend Tauri Invoke Pattern
```typescript
import { invoke } from "@tauri-apps/api/core";

const result = await invoke<ReturnType>("command_name", { param: value });
```

### Error Handling
- Rust commands return `Result<T, String>` — never panic
- Frontend wraps all `invoke()` calls in try/catch
- User-visible errors shown via toast notifications (not alerts)

### File Organization
- One component per file, filename matches export name
- Pages handle routing and state; components are presentational
- All Tauri IPC calls happen in page files, not in components

### Security Rules (never violate)
- Never log or print plaintext passwords anywhere
- Never store the derived encryption key in React state — it lives only in Rust `State`
- Always clear clipboard after 30 seconds after a copy action
- The `crypto.rs` module is the only place encryption/decryption happens

---

## Testing

- **Rust unit tests:** `cargo test` from `src-tauri/`
- **Test location:** `src-tauri/src/` — inline `#[cfg(test)]` modules in each file
- **What to test:** `crypto.rs` functions (hash, encrypt, decrypt round-trips), `db.rs` CRUD operations
- **Frontend tests:** Not in MVP scope

---

## Validation Checklist (before committing)

```bash
# 1. Rust checks
cd src-tauri && cargo check && cargo clippy -- -D warnings

# 2. Frontend type check
npm run type-check

# 3. Full build
npm run tauri build
```

---

## Key Files

| File | Purpose |
|---|---|
| `PRD.md` | Full product spec and requirements |
| `src-tauri/src/crypto.rs` | All encryption logic — touch carefully |
| `src-tauri/src/db.rs` | SQLite schema and all DB queries |
| `src-tauri/src/commands.rs` | All Tauri IPC command handlers |
| `src-tauri/src/models.rs` | Shared data structures |
| `src/App.tsx` | React Router setup and auth routing guard |
| `src/pages/Dashboard.tsx` | Main vault UI — most complex frontend file |

---

## On-Demand Context

| Topic | Reference |
|---|---|
| Tauri commands guide | https://tauri.app/v2/guides/inter-process-communication/ |
| AES-GCM usage | https://docs.rs/aes-gcm/latest/aes_gcm/ |
| Argon2 usage | https://docs.rs/argon2/latest/argon2/ |
| rusqlite guide | https://docs.rs/rusqlite/latest/rusqlite/ |
| Tailwind docs | https://tailwindcss.com/docs |

---

## Notes

- This is a **single-binary desktop app** — there is no server, no API, no network
- The SQLite DB lives at the Tauri app data directory (platform-specific, managed by Tauri)
- **If the user loses their master password, all data is unrecoverable** — this is by design
- Tauri 2 uses `@tauri-apps/api/core` for `invoke()`, not `@tauri-apps/api/tauri` (v1 style)
- Windows requires Microsoft C++ Build Tools and WebView2 to build/run
- Do NOT use `tauri::command` async unless truly needed — keep commands synchronous for simplicity
