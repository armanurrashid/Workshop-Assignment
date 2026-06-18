# Feature: Secure Desktop Password Manager (Full Build)

The following plan is complete and implementation-ready. Read AGENTS.md and PRD.md before starting.
Pay close attention to naming, import paths, and the security rules in AGENTS.md.

## Feature Description

Build a complete Tauri 2 desktop password manager from scratch. Includes a Rust backend with AES-256-GCM
encryption and Argon2id password hashing, a React/TypeScript frontend with Tailwind CSS, and SQLite storage.
Three screens: Register, Login, Dashboard.

## User Story

As a privacy-conscious user
I want a local desktop app to store my passwords encrypted
So that my credentials are safe on my machine without any cloud risk

## Problem Statement

No simple, auditable, offline password manager exists that a developer can build and understand in a day.

## Solution Statement

Tauri gives us a small, secure desktop binary. Rust handles all crypto and storage. React + Tailwind gives us
a clean UI. Everything runs locally — no network needed.

## Feature Metadata

**Feature Type**: New Capability  
**Estimated Complexity**: High  
**Primary Systems Affected**: All (greenfield)  
**Dependencies**: Tauri 2, React 18, Rust stable, argon2, aes-gcm, rusqlite, Tailwind CSS 3

---

## CONTEXT REFERENCES

### Relevant Codebase Files — READ BEFORE IMPLEMENTING

- `PRD.md` — Full requirements, scope, architecture diagram, security model
- `AGENTS.md` — Conventions, command patterns, security rules, file structure

### New Files to Create

**Frontend:**
- `index.html` — Vite HTML entry
- `package.json` — npm dependencies and scripts
- `vite.config.ts` — Vite config with Tauri plugin
- `tsconfig.json` — TypeScript config
- `tsconfig.node.json` — TypeScript config for Vite
- `tailwind.config.js` — Tailwind config
- `postcss.config.js` — PostCSS config
- `src/main.tsx` — React DOM entry
- `src/App.tsx` — Router with auth guard
- `src/index.css` — Tailwind base styles
- `src/pages/Register.tsx` — Registration screen
- `src/pages/Login.tsx` — Login screen
- `src/pages/Dashboard.tsx` — Vault dashboard
- `src/components/Header.tsx` — Top navigation bar
- `src/components/PasswordCard.tsx` — Single entry card
- `src/components/AddPasswordModal.tsx` — Add/edit modal

**Rust/Tauri Backend:**
- `src-tauri/Cargo.toml` — Rust dependencies
- `src-tauri/build.rs` — Tauri build script
- `src-tauri/tauri.conf.json` — Tauri configuration
- `src-tauri/capabilities/default.json` — Tauri v2 capabilities
- `src-tauri/src/main.rs` — App entry point and state setup
- `src-tauri/src/lib.rs` — Tauri builder and command registration
- `src-tauri/src/models.rs` — Shared data structs
- `src-tauri/src/crypto.rs` — Argon2id + AES-256-GCM
- `src-tauri/src/db.rs` — SQLite schema and CRUD
- `src-tauri/src/commands.rs` — All Tauri IPC handlers

### Relevant Documentation

- [Tauri v2 Commands](https://tauri.app/v2/guides/inter-process-communication/)
- [aes-gcm crate](https://docs.rs/aes-gcm/latest/aes_gcm/)
- [argon2 crate](https://docs.rs/argon2/latest/argon2/)
- [rusqlite](https://docs.rs/rusqlite/latest/rusqlite/)
- [Tauri v2 State Management](https://tauri.app/v2/guides/state-management/)

### Patterns to Follow

**Tauri Command Pattern (Rust):**
```rust
#[tauri::command]
fn my_command(param: String, state: tauri::State<'_, AppState>) -> Result<String, String> {
    Ok("result".to_string())
}
```

**Invoke Pattern (TypeScript):**
```typescript
import { invoke } from "@tauri-apps/api/core";
const result = await invoke<string>("my_command", { param: "value" });
```

**AES-256-GCM Encrypt Pattern (Rust):**
```rust
use aes_gcm::{Aes256Gcm, Key, Nonce, aead::{Aead, KeyInit, OsRng, rand_core::RngCore}};
let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
let cipher = Aes256Gcm::new(key);
let mut nonce_bytes = [0u8; 12];
OsRng.fill_bytes(&mut nonce_bytes);
let nonce = Nonce::from_slice(&nonce_bytes);
let ciphertext = cipher.encrypt(nonce, plaintext.as_bytes()).map_err(|e| e.to_string())?;
```

**Argon2id Hash Pattern (Rust):**
```rust
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier, password_hash::{rand_core::OsRng, SaltString}};
let salt = SaltString::generate(&mut OsRng);
let argon2 = Argon2::default();
let hash = argon2.hash_password(password.as_bytes(), &salt)?.to_string();
```

---

## IMPLEMENTATION PLAN

### Phase 1: Project Scaffold

Set up the Tauri + React + Vite + Tailwind project structure and verify it compiles.

**Tasks:**
- Create `package.json` with all frontend deps
- Create `index.html`, `vite.config.ts`, TypeScript configs
- Create `tailwind.config.js` and `postcss.config.js`
- Create `src-tauri/Cargo.toml` with all Rust deps
- Create `src-tauri/tauri.conf.json` and capabilities
- Create `src-tauri/build.rs`
- Create minimal `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create placeholder Rust files (main.rs, lib.rs)

### Phase 2: Rust Backend

Implement all Rust modules with full crypto and DB logic.

**Tasks:**
- `models.rs` — define `PasswordEntry`, `NewPasswordEntry`, `AppState` structs
- `crypto.rs` — implement `hash_password`, `verify_password`, `derive_key`, `encrypt`, `decrypt`
- `db.rs` — implement `initialize_db`, `is_registered`, `register_user`, `verify_login`, `get_all_passwords`, `add_password`, `delete_password`
- `commands.rs` — implement all Tauri commands: `check_registered`, `register`, `login`, `logout`, `get_passwords`, `add_password`, `delete_password`
- `lib.rs` — register all commands with Tauri builder
- `main.rs` — set up AppState, call lib

### Phase 3: Frontend Pages

Build all React pages and components.

**Tasks:**
- `src/App.tsx` — React Router setup, auth guard using `check_registered` and session state
- `src/pages/Register.tsx` — form with password + confirm, calls `register` command
- `src/pages/Login.tsx` — form with master password, calls `login` command
- `src/pages/Dashboard.tsx` — calls `get_passwords`, search filter, manages modal state
- `src/components/Header.tsx` — app title + logout button
- `src/components/PasswordCard.tsx` — shows entry, copy/show/delete actions
- `src/components/AddPasswordModal.tsx` — form modal, calls `add_password`

### Phase 4: Polish

Wire up UX details: loading states, error display, clipboard clear, auto-lock.

**Tasks:**
- Add clipboard auto-clear (30s timeout) after copy
- Auto-lock (navigate to /login) on Tauri window blur/minimize event
- Toast notification component for errors and success
- Empty state on dashboard when vault is empty
- Smooth transitions between screens

---

## STEP-BY-STEP TASKS

### TASK 1: CREATE `package.json`
- **IMPLEMENT**: All frontend dependencies — react, react-dom, react-router-dom, @tauri-apps/api, tailwindcss, vite, @vitejs/plugin-react, typescript, postcss, autoprefixer
- **VALIDATE**: `npm install` runs without errors

### TASK 2: CREATE `index.html`
- **IMPLEMENT**: Minimal HTML with `<div id="root">` and script tag to `src/main.tsx`
- **VALIDATE**: File exists and is valid HTML

### TASK 3: CREATE `vite.config.ts`
- **IMPLEMENT**: Vite config with `@vitejs/plugin-react`, set server port to 1420 (Tauri default), set `clearScreen: false`
- **GOTCHA**: Tauri's dev server expects port 1420 by default — must match `tauri.conf.json`

### TASK 4: CREATE TypeScript configs
- **IMPLEMENT**: `tsconfig.json` targeting ES2020, `tsconfig.node.json` for Vite config file
- **VALIDATE**: `npm run type-check` passes (after all TS files exist)

### TASK 5: CREATE Tailwind configs
- **IMPLEMENT**: `tailwind.config.js` with content paths covering `./src/**/*.{ts,tsx}`, `postcss.config.js` with tailwindcss and autoprefixer

### TASK 6: CREATE `src-tauri/Cargo.toml`
- **IMPLEMENT**: Package metadata, Tauri features (`shell-open`), all dependencies:
  - `tauri = { version = "2", features = [] }`
  - `tauri-build = { version = "2", features = [] }` (build-dependency)
  - `serde = { version = "1", features = ["derive"] }`
  - `serde_json = "1"`
  - `rusqlite = { version = "0.31", features = ["bundled"] }`
  - `argon2 = "0.5"`
  - `aes-gcm = "0.10"`
  - `rand = "0.8"`
  - `base64 = "0.22"`
- **GOTCHA**: Use `features = ["bundled"]` for rusqlite to avoid needing system SQLite

### TASK 7: CREATE `src-tauri/build.rs`
- **IMPLEMENT**: Single line: `fn main() { tauri_build::build() }`

### TASK 8: CREATE `src-tauri/tauri.conf.json`
- **IMPLEMENT**: App identifier `com.workshop.passwordmanager`, window title "Password Manager", size 900x700, dev URL `http://localhost:1420`, build commands

### TASK 9: CREATE `src-tauri/capabilities/default.json`
- **IMPLEMENT**: Default Tauri v2 capabilities file allowing clipboard and window access

### TASK 10: CREATE `src-tauri/src/models.rs`
- **IMPLEMENT**:
  ```rust
  #[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
  pub struct PasswordEntry {
      pub id: i64,
      pub title: String,
      pub username: String,
      pub password: String,  // decrypted, only in memory
      pub url: String,
      pub notes: String,
  }
  
  #[derive(Debug, serde::Deserialize)]
  pub struct NewPasswordEntry {
      pub title: String,
      pub username: String,
      pub password: String,
      pub url: String,
      pub notes: String,
  }
  
  pub struct AppState {
      pub db_path: std::sync::Mutex<String>,
      pub encryption_key: std::sync::Mutex<Option<[u8; 32]>>,
  }
  ```

### TASK 11: CREATE `src-tauri/src/crypto.rs`
- **IMPLEMENT**:
  - `hash_password(password: &str) -> Result<String, String>` — Argon2id hash
  - `verify_password(password: &str, hash: &str) -> Result<bool, String>` — Argon2id verify
  - `derive_key(password: &str, salt: &[u8]) -> [u8; 32]` — derive 256-bit key using Argon2id output
  - `encrypt(plaintext: &str, key: &[u8; 32]) -> Result<String, String>` — AES-256-GCM, returns base64(nonce + ciphertext)
  - `decrypt(encoded: &str, key: &[u8; 32]) -> Result<String, String>` — AES-256-GCM decrypt
- **GOTCHA**: Store nonce prepended to ciphertext, both base64-encoded as a single string for easy DB storage

### TASK 12: CREATE `src-tauri/src/db.rs`
- **IMPLEMENT**:
  - `get_db_path() -> String` — use `dirs` or hardcode to app data dir (for simplicity, use `./vault.db`)
  - `initialize_db(db_path: &str) -> Result<(), String>` — create tables if not exists:
    ```sql
    CREATE TABLE IF NOT EXISTS master (
        id INTEGER PRIMARY KEY,
        password_hash TEXT NOT NULL,
        key_salt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS passwords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        username TEXT NOT NULL,
        password_encrypted TEXT NOT NULL,
        url TEXT NOT NULL,
        notes TEXT NOT NULL
    );
    ```
  - `is_registered(db_path: &str) -> Result<bool, String>` — check if master table has a row
  - `store_master(db_path: &str, hash: &str, salt: &str) -> Result<(), String>`
  - `get_master(db_path: &str) -> Result<(String, String), String>` — returns (hash, salt)
  - `get_all_passwords(db_path: &str, key: &[u8; 32]) -> Result<Vec<PasswordEntry>, String>` — fetch and decrypt all
  - `add_password(db_path: &str, entry: &NewPasswordEntry, key: &[u8; 32]) -> Result<i64, String>` — encrypt and insert
  - `delete_password(db_path: &str, id: i64) -> Result<(), String>`

### TASK 13: CREATE `src-tauri/src/commands.rs`
- **IMPLEMENT** these Tauri commands:
  - `check_registered(state) -> Result<bool, String>`
  - `register(password: String, state) -> Result<(), String>` — hash pw, derive key, store both, set key in state
  - `login(password: String, state) -> Result<(), String>` — verify pw, derive key, set key in state
  - `logout(state) -> Result<(), String>` — clear key from state
  - `get_passwords(state) -> Result<Vec<PasswordEntry>, String>` — get key from state, fetch all
  - `add_password(entry: NewPasswordEntry, state) -> Result<i64, String>`
  - `delete_password(id: i64, state) -> Result<(), String>`

### TASK 14: CREATE `src-tauri/src/lib.rs`
- **IMPLEMENT**: `pub fn run()` that builds Tauri app, initializes AppState, registers all commands, calls `.run()`

### TASK 15: CREATE `src-tauri/src/main.rs`
- **IMPLEMENT**: `fn main() { password_manager_lib::run() }` — minimal, delegates to lib.rs

### TASK 16: CREATE `src/index.css`
- **IMPLEMENT**: `@tailwind base; @tailwind components; @tailwind utilities;` and root body styles (dark background `#0f0f0f`, font)

### TASK 17: CREATE `src/main.tsx`
- **IMPLEMENT**: Standard React 18 `createRoot` setup, import App and index.css

### TASK 18: CREATE `src/App.tsx`
- **IMPLEMENT**: React Router v6 with three routes: `/register`, `/login`, `/dashboard`
- **IMPLEMENT**: On app load, call `check_registered` — if not registered, redirect to `/register`; if registered and not logged in, redirect to `/login`
- **IMPLEMENT**: Session state stored in React context or simple module-level flag (not the key itself)

### TASK 19: CREATE `src/components/Header.tsx`
- **IMPLEMENT**: App name on left, logout button on right. Logout calls `logout` command then navigates to `/login`

### TASK 20: CREATE `src/pages/Register.tsx`
- **IMPLEMENT**: Two password fields (password + confirm), validation that they match, calls `register` command, navigates to `/login` on success
- **IMPLEMENT**: Clean centered card layout, error message display

### TASK 21: CREATE `src/pages/Login.tsx`
- **IMPLEMENT**: Single password field, calls `login` command, navigates to `/dashboard` on success
- **IMPLEMENT**: Error display for wrong password

### TASK 22: CREATE `src/components/AddPasswordModal.tsx`
- **IMPLEMENT**: Modal overlay with form fields: Title*, Username, Password* (with show/hide toggle), URL, Notes
- **IMPLEMENT**: On submit calls `add_password` command, calls `onSave` callback on success

### TASK 23: CREATE `src/components/PasswordCard.tsx`
- **IMPLEMENT**: Card showing title, username, masked password, URL
- **IMPLEMENT**: Three icon buttons: copy password (clipboard + 30s clear), show/hide password, delete (with confirm)
- **GOTCHA**: Copy to clipboard using `navigator.clipboard.writeText()`, clear with `setTimeout`

### TASK 24: CREATE `src/pages/Dashboard.tsx`
- **IMPLEMENT**: Calls `get_passwords` on mount, stores entries in state
- **IMPLEMENT**: Search input filters entries by title/username in real-time (client-side filter)
- **IMPLEMENT**: Grid of `PasswordCard` components
- **IMPLEMENT**: FAB button (bottom-right) opens `AddPasswordModal`
- **IMPLEMENT**: On delete: calls `delete_password` command, removes from local state
- **IMPLEMENT**: Auto-lock: listen for Tauri window `blur` or `focus` loss event, navigate to `/login` and call `logout`
- **IMPLEMENT**: Empty state: centered message when no passwords exist

---

## TESTING STRATEGY

### Unit Tests (Rust)
Add `#[cfg(test)]` blocks in:
- `crypto.rs` — test hash/verify round-trip, test encrypt/decrypt round-trip
- `db.rs` — test initialize_db creates tables, test add/get/delete cycle

### Manual Validation
1. Run `npm run tauri dev`
2. App opens on Register screen (first run)
3. Register with a master password
4. App navigates to Login
5. Enter master password → navigates to Dashboard
6. Click "+" → Add a password entry → appears in vault
7. Copy password → check clipboard → wait 30s → clipboard should clear
8. Show/hide password toggle works
9. Delete entry → confirm → entry removed
10. Search by title filters results
11. Logout → back to Login
12. Re-login → same entries are there (persisted and decrypted correctly)
13. Quit and reopen → goes to Login (not Register)

---

## VALIDATION COMMANDS

### Level 1: Rust
```bash
cd src-tauri && cargo check
cd src-tauri && cargo clippy -- -D warnings
cd src-tauri && cargo test
```

### Level 2: Frontend
```bash
npm run type-check
```

### Level 3: Full Build
```bash
npm run tauri build
```

### Level 4: Dev Run
```bash
npm run tauri dev
```

---

## ACCEPTANCE CRITERIA

- [ ] `cargo check` passes with zero errors
- [ ] `npm run type-check` passes with zero errors
- [ ] App launches and shows Register screen on first run
- [ ] Registration creates an encrypted vault
- [ ] Login with correct password opens vault, wrong password shows error
- [ ] Can add a password entry with title + password (minimum)
- [ ] Stored passwords are encrypted in SQLite (verify by opening vault.db with SQLite browser)
- [ ] Copy button copies to clipboard and clears after 30s
- [ ] Delete removes entry
- [ ] Search filters entries
- [ ] Logout clears session and returns to Login
- [ ] Reopening app goes to Login, not Register

---

## COMPLETION CHECKLIST

- [ ] All 24 tasks completed
- [ ] `cargo check` clean
- [ ] TypeScript type-check clean
- [ ] Manual test flow passes (Tasks 1-13 in manual validation above)
- [ ] No plaintext passwords in DB (spot check)
- [ ] No console errors in dev tools
- [ ] App is locked after logout

---

## NOTES

- **Rust must be installed** (`rustup.rs`) before `npm run tauri dev` will work
- Windows also needs Microsoft C++ Build Tools and WebView2
- The vault.db file is created in the current working directory for simplicity; production would use Tauri's app data dir
- Clipboard auto-clear uses a JS setTimeout — this is a best-effort security measure
- The derived encryption key (`[u8; 32]`) is held only in Rust `Mutex<Option<[u8; 32]>>` state and never sent to the frontend
- On logout/lock, the key is set to `None` in state, so re-authentication is required
