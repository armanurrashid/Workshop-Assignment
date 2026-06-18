# PRD: Secure Desktop Password Manager

## 1. Executive Summary

A lightweight, offline-first desktop password manager built with Tauri (Rust + React). Users register with a master password, which is used to derive an encryption key. All stored passwords are encrypted at rest using AES-256-GCM. The app presents a clean, minimalist interface focused on speed and clarity.

The MVP delivers three core screens: registration, login, and a password vault dashboard. No cloud sync, no browser extension — just a secure local vault.

**MVP Goal:** A working, installable desktop app where a user can register, log in, and securely store, view, copy, and delete passwords.

---

## 2. Mission

Build the simplest possible password manager that a developer would actually trust with their passwords.

**Core Principles:**
1. Security first — encryption is non-negotiable, not optional
2. Offline by default — no network calls, no telemetry
3. Minimalist UI — every pixel earns its place
4. Fast — vault opens instantly, searches are instant
5. Portable — single binary, no installer required

---

## 3. Target Users

**Primary Persona: The Developer**
- Technically comfortable, privacy-conscious
- Frustrated by bloated password managers (LastPass, 1Password)
- Wants something they can understand and trust
- Pain points: cloud sync risks, subscription fees, slow UIs

**Secondary Persona: The Privacy-Conscious User**
- Non-technical but cautious
- Prefers local storage over cloud
- Needs a simple, clear interface

---

## 4. MVP Scope

### In Scope ✅
**Core Functionality:**
- ✅ Master password registration (Argon2id hashing)
- ✅ Master password login with session management
- ✅ Add password entry (title, username, password, URL, notes)
- ✅ View all passwords in a vault dashboard
- ✅ Copy password/username to clipboard (auto-clears after 30s)
- ✅ Delete password entry
- ✅ Show/hide password toggle
- ✅ Search/filter entries by title

**Technical:**
- ✅ AES-256-GCM encryption for all stored passwords
- ✅ Argon2id for master password hashing
- ✅ Local SQLite database
- ✅ Single-user vault (one master password)
- ✅ Auto-lock on window minimize

**UI:**
- ✅ Registration screen
- ✅ Login screen
- ✅ Dashboard / vault screen
- ✅ Add/Edit password modal
- ✅ Responsive layout

### Out of Scope ❌
- ❌ Cloud sync or backup
- ❌ Multiple user accounts
- ❌ Browser extension
- ❌ Password generator (post-MVP)
- ❌ Import/export (post-MVP)
- ❌ Two-factor authentication
- ❌ Password strength meter
- ❌ Categories/folders

---

## 5. User Stories

1. **As a new user**, I want to register with a master password, so that I can create my encrypted vault.
   - Example: User opens app for the first time, sees registration screen, sets master password, vault is created.

2. **As a returning user**, I want to log in with my master password, so that I can access my saved passwords.
   - Example: User opens app, enters master password, vault unlocks and shows saved entries.

3. **As a logged-in user**, I want to add a new password entry, so that I can store credentials securely.
   - Example: User clicks "Add Password", fills in title/username/password/URL, saves — entry appears in vault.

4. **As a logged-in user**, I want to copy a password to clipboard, so that I can use it without revealing it on screen.
   - Example: User clicks copy icon, password is in clipboard, clears after 30 seconds.

5. **As a logged-in user**, I want to search my vault, so that I can quickly find a specific entry.
   - Example: User types "github" in search bar, only matching entries are shown.

6. **As a logged-in user**, I want to delete an entry, so that I can remove outdated credentials.
   - Example: User clicks delete icon, confirms, entry is removed from vault.

7. **As a security-conscious user**, I want the app to lock when I minimize it, so that others can't access my vault if I walk away.

---

## 6. Core Architecture & Patterns

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│           Tauri Desktop App             │
│                                         │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │   Frontend   │  │  Rust Backend    │ │
│  │  React + TS  │◄─┤  (Tauri Core)    │ │
│  │  Tailwind    │  │                  │ │
│  │  Vite        │  │  ┌────────────┐  │ │
│  └──────────────┘  │  │  commands  │  │ │
│                    │  │  crypto    │  │ │
│                    │  │  db        │  │ │
│                    │  └────────────┘  │ │
│                    │       │          │ │
│                    │  ┌────▼───────┐  │ │
│                    │  │  SQLite DB │  │ │
│                    │  └────────────┘  │ │
│                    └──────────────────┘ │
└─────────────────────────────────────────┘
```

### Directory Structure

```
password-manager/
├── src/                        # React frontend
│   ├── pages/
│   │   ├── Register.tsx
│   │   ├── Login.tsx
│   │   └── Dashboard.tsx
│   ├── components/
│   │   ├── PasswordCard.tsx
│   │   ├── AddPasswordModal.tsx
│   │   └── Header.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── src-tauri/                  # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs
│   │   ├── crypto.rs
│   │   ├── db.rs
│   │   └── models.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 7. Features

### Registration
- Single screen with master password + confirm fields
- Password strength indicator
- On submit: hash master password with Argon2id, store hash, derive encryption key, create SQLite DB

### Login
- Master password input
- On submit: hash input, compare with stored hash, derive key, load vault
- Failed login shows error (no lockout in MVP)

### Dashboard / Vault
- Search bar at top
- Grid/list of password cards
- Each card shows: title, username, masked password, copy/show/delete actions
- FAB (floating action button) to add new entry
- Logout button in header

### Add/Edit Password Modal
- Fields: Title (required), Username, Password (with show/hide), URL, Notes
- Save button triggers Tauri command → encrypts and stores in SQLite

---

## 8. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Desktop Framework | Tauri | 2.x |
| Frontend Language | TypeScript | 5.x |
| Frontend Framework | React | 18.x |
| Build Tool | Vite | 5.x |
| Styling | Tailwind CSS | 3.x |
| Backend Language | Rust | stable |
| Database | SQLite (via rusqlite) | latest |
| Password Hashing | Argon2 (argon2 crate) | latest |
| Encryption | AES-256-GCM (aes-gcm crate) | latest |
| Key Derivation | PBKDF2 / Argon2 | latest |
| Serialization | serde + serde_json | latest |
| Routing (frontend) | react-router-dom | v6 |

---

## 9. Security & Configuration

### Encryption Model
```
Master Password
     │
     ▼
Argon2id Hash ──────────────► Stored in DB (for login verification)
     │
     ▼
Derive 256-bit Key (Argon2id + fixed salt per vault)
     │
     ▼
AES-256-GCM Encrypt each password field
     │
     ▼
Store ciphertext + nonce in SQLite
```

### Security Scope
- **In scope:** Encryption at rest, secure key derivation, clipboard auto-clear
- **Out of scope:** Memory protection (mlock), secure deletion, side-channel attacks

### Configuration
- DB path: Tauri app data directory (`$APPDATA/password-manager/vault.db` on Windows)
- No `.env` files needed — all config is baked into Tauri

---

## 10. Success Criteria

### Functional Requirements ✅
- ✅ User can register and the vault is created encrypted
- ✅ User can log in and view their passwords
- ✅ User can add, view, copy, and delete passwords
- ✅ All passwords are encrypted in the SQLite database
- ✅ App locks on minimize

### Quality Indicators
- Login to vault in < 1 second
- Search results update in real-time (no lag)
- No plaintext passwords visible in the database file

### User Experience Goals
- First-time user can register and add a password in under 2 minutes
- UI is clean enough that no documentation is needed

---

## 11. Implementation Phases

### Phase 1: Project Scaffold & Backend Foundation
**Goal:** Tauri project running with Rust crypto and DB layer
- ✅ Initialize Tauri + React + Vite + Tailwind
- ✅ Set up SQLite database with schema
- ✅ Implement Argon2id hashing
- ✅ Implement AES-256-GCM encryption/decryption
- ✅ Wire up basic Tauri commands
**Validation:** `cargo tauri dev` launches a blank window

### Phase 2: Auth Screens
**Goal:** Registration and login working end-to-end
- ✅ Registration page with form validation
- ✅ Login page with master password check
- ✅ React Router routing between screens
- ✅ Session state (in-memory key after login)
**Validation:** Can register, restart app, log back in

### Phase 3: Vault Dashboard
**Goal:** Full CRUD on password entries
- ✅ Dashboard with password cards
- ✅ Add password modal
- ✅ Copy to clipboard with auto-clear
- ✅ Show/hide password toggle
- ✅ Delete entry
- ✅ Search/filter
**Validation:** Full user flow works end-to-end

### Phase 4: Polish & Security
**Goal:** Production-ready UX and security hardening
- ✅ Auto-lock on minimize
- ✅ Minimalist UI polish
- ✅ Error handling and toast notifications
- ✅ Loading states
**Validation:** App feels complete, no rough edges

---

## 12. Future Considerations

- Password generator (random secure passwords)
- Import/export (CSV, JSON, 1Password format)
- Categories and tags for organization
- Password history (last 5 versions)
- Auto-fill via browser extension
- Biometric unlock (Windows Hello / macOS Touch ID via Tauri)
- Encrypted backup to local file

---

## 13. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| User forgets master password | Document clearly: no recovery possible. Consider optional hint. |
| Rust/Tauri setup complexity on Windows | Document prerequisites clearly (MSVC, WebView2) |
| Clipboard not clearing on all platforms | Use Tauri's clipboard API + JS timeout as fallback |
| SQLite file corruption | Tauri handles app data directory safely; add basic error handling |
| Key not cleared from memory on lock | Out of scope for MVP; document as known limitation |

---

## 14. Appendix

### Prerequisites (Developer)
- [Rust](https://rustup.rs) — install via rustup
- [Node.js 18+](https://nodejs.org)
- Windows: Microsoft C++ Build Tools + WebView2 (usually pre-installed on Win10/11)

### Key Dependencies
- [Tauri v2](https://tauri.app/v2/guides/)
- [aes-gcm crate](https://docs.rs/aes-gcm)
- [argon2 crate](https://docs.rs/argon2)
- [rusqlite](https://docs.rs/rusqlite)
- [react-router-dom v6](https://reactrouter.com/en/main)
- [Tailwind CSS](https://tailwindcss.com/docs)
