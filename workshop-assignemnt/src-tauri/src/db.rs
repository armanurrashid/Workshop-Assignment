use rusqlite::{Connection, params};
use crate::crypto::{decrypt, encrypt};
use crate::models::{NewPasswordEntry, PasswordEntry};

pub fn initialize_db(db_path: &str) -> Result<(), String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS master (
            id          INTEGER PRIMARY KEY,
            password_hash TEXT NOT NULL,
            key_salt    TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS passwords (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            title               TEXT NOT NULL,
            username            TEXT NOT NULL DEFAULT '',
            password_encrypted  TEXT NOT NULL,
            url                 TEXT NOT NULL DEFAULT '',
            notes               TEXT NOT NULL DEFAULT ''
        );",
    )
    .map_err(|e| e.to_string())
}

pub fn is_registered(db_path: &str) -> Result<bool, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM master", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    Ok(count > 0)
}

pub fn store_master(db_path: &str, hash: &str, salt: &str) -> Result<(), String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO master (password_hash, key_salt) VALUES (?1, ?2)",
        params![hash, salt],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn get_master(db_path: &str) -> Result<(String, String), String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT password_hash, key_salt FROM master LIMIT 1",
        [],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )
    .map_err(|e| e.to_string())
}

pub fn get_all_passwords(db_path: &str, key: &[u8; 32]) -> Result<Vec<PasswordEntry>, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, title, username, password_encrypted, url, notes FROM passwords ORDER BY title ASC")
        .map_err(|e| e.to_string())?;

    let entries = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, String>(5)?,
            ))
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    let mut result = Vec::new();
    for (id, title, username, password_encrypted, url, notes) in entries {
        let password = decrypt(&password_encrypted, key)?;
        result.push(PasswordEntry {
            id,
            title,
            username,
            password,
            url,
            notes,
        });
    }
    Ok(result)
}

pub fn add_password(
    db_path: &str,
    entry: &NewPasswordEntry,
    key: &[u8; 32],
) -> Result<i64, String> {
    let password_encrypted = encrypt(&entry.password, key)?;
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO passwords (title, username, password_encrypted, url, notes) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![entry.title, entry.username, password_encrypted, entry.url, entry.notes],
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub fn delete_password(db_path: &str, id: i64) -> Result<(), String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM passwords WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
