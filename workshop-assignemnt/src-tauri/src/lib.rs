mod commands;
mod crypto;
mod db;
mod models;

use commands::{
    add_password_entry, check_registered, delete_password_entry, get_passwords, login, logout,
    register,
};
use models::AppState;

pub fn run() {
    let db_path = get_db_path();
    db::initialize_db(&db_path).expect("Failed to initialize database");

    let state = AppState::new(db_path);

    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            check_registered,
            register,
            login,
            logout,
            get_passwords,
            add_password_entry,
            delete_password_entry,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn get_db_path() -> String {
    // Use a local vault.db in the current directory for simplicity.
    // In production, use tauri::api::path::app_data_dir.
    "vault.db".to_string()
}
