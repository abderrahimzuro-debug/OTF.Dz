use serde::Serialize;

#[derive(Serialize)]
struct RuntimeInfo {
    version: String,
    platform: String,
    arch: String,
}

#[tauri::command]
fn get_runtime_info(app: tauri::AppHandle) -> RuntimeInfo {
    RuntimeInfo {
        version: app.package_info().version.to_string(),
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
    }
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_runtime_info])
        .run(tauri::generate_context!())
        .expect("error while running OTF.Dz");
}
