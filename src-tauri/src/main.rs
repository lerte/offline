// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod audio_service;
use audio_service::{AudioEvent, AudioService};
use std::io::BufReader;
use tokio::sync::broadcast::Sender;

/// Receive events sent by the front end, encapsulate them as [`AudioEvent`] and send them to the channel.
#[tauri::command]
fn handle_event(
    handle: tauri::AppHandle,
    sender: tauri::State<Sender<AudioEvent>>,
    action: String,
) {
    let resource_path = handle
        .path_resolver()
        .resolve_resource("./resources/1.mp3")
        .expect("failed to resolve resource");
    let file_path = resource_path.to_str().unwrap();

    if action == "play" {
        let _ = sender.send(AudioEvent::Play(String::from(file_path)));
    }
    if action == "stop" {
        let _ = sender.send(AudioEvent::Pause);
    }
}

#[tauri::command]
fn alarm(handle: tauri::AppHandle) {
    let (_stream, stream_handle) = rodio::OutputStream::try_default().unwrap();
    let resource_path = handle
        .path_resolver()
        .resolve_resource("./resources/1.mp3")
        .expect("failed to resolve resource");

    let sink = rodio::Sink::try_new(&stream_handle).unwrap();
    let file = std::fs::File::open(&resource_path).unwrap();
    sink.append(rodio::Decoder::new(BufReader::new(file)).unwrap());
    sink.set_volume(0.5);
    sink.sleep_until_end();
}

#[tokio::main]
async fn main() {
    let audio_service = AudioService::new();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![handle_event])
        .manage(audio_service.event_sender) // share
        .manage(audio_service.sink)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
