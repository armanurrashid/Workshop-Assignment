use std::sync::Mutex;

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct PasswordEntry {
    pub id: i64,
    pub title: String,
    pub username: String,
    pub password: String,
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
    pub db_path: Mutex<String>,
    pub encryption_key: Mutex<Option<[u8; 32]>>,
}

impl AppState {
    pub fn new(db_path: String) -> Self {
        AppState {
            db_path: Mutex::new(db_path),
            encryption_key: Mutex::new(None),
        }
    }
}
