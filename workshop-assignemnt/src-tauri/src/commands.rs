use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use rand::RngCore;
use tauri::State;

use crate::{
    crypto::{derive_key, hash_password, verify_password},
    db::{add_password, delete_password, get_all_passwords, get_master, is_registered, store_master},
    models::{AppState, NewPasswordEntry, PasswordEntry},
};

#[tauri::command]
pub fn check_registered(state: State<'_, AppState>) -> Result<bool, String> {
    let db_path = state.db_path.lock().map_err(|e| e.to_string())?;
    is_registered(&db_path)
}

#[tauri::command]
pub fn register(password: String, state: State<'_, AppState>) -> Result<(), String> {
    let db_path = state.db_path.lock().map_err(|e| e.to_string())?;

    if is_registered(&db_path)? {
        return Err("Already registered".to_string());
    }

    // Generate a random 32-byte salt for key derivation
    let mut salt_bytes = [0u8; 32];
    rand::thread_rng().fill_bytes(&mut salt_bytes);
    let salt_b64 = BASE64.encode(salt_bytes);

    let hash = hash_password(&password)?;
    store_master(&db_path, &hash, &salt_b64)?;

    // Derive and store the key in state
    let key = derive_key(&password, &salt_bytes)?;
    drop(db_path);
    let mut enc_key = state.encryption_key.lock().map_err(|e| e.to_string())?;
    *enc_key = Some(key);

    Ok(())
}

#[tauri::command]
pub fn login(password: String, state: State<'_, AppState>) -> Result<(), String> {
    let db_path = state.db_path.lock().map_err(|e| e.to_string())?;
    let (hash, salt_b64) = get_master(&db_path)?;

    let valid = verify_password(&password, &hash)?;
    if !valid {
        return Err("Incorrect master password".to_string());
    }

    let salt_bytes = BASE64.decode(&salt_b64).map_err(|e| e.to_string())?;
    let key = derive_key(&password, &salt_bytes)?;

    drop(db_path);
    let mut enc_key = state.encryption_key.lock().map_err(|e| e.to_string())?;
    *enc_key = Some(key);

    Ok(())
}

#[tauri::command]
pub fn logout(state: State<'_, AppState>) -> Result<(), String> {
    let mut enc_key = state.encryption_key.lock().map_err(|e| e.to_string())?;
    *enc_key = None;
    Ok(())
}

#[tauri::command]
pub fn get_passwords(state: State<'_, AppState>) -> Result<Vec<PasswordEntry>, String> {
    let db_path = state.db_path.lock().map_err(|e| e.to_string())?;
    let enc_key = state.encryption_key.lock().map_err(|e| e.to_string())?;

    let key = enc_key.as_ref().ok_or("Not logged in")?;
    get_all_passwords(&db_path, key)
}

#[tauri::command]
pub fn add_password_entry(
    entry: NewPasswordEntry,
    state: State<'_, AppState>,
) -> Result<i64, String> {
    let db_path = state.db_path.lock().map_err(|e| e.to_string())?;
    let enc_key = state.encryption_key.lock().map_err(|e| e.to_string())?;

    let key = enc_key.as_ref().ok_or("Not logged in")?;
    add_password(&db_path, &entry, key)
}

#[tauri::command]
pub fn delete_password_entry(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let db_path = state.db_path.lock().map_err(|e| e.to_string())?;
    delete_password(&db_path, id)
}
