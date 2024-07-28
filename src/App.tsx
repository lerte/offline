import "./App.css";

import { http, invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";

import { ResponseType } from "@tauri-apps/api/http";
import { useInterval } from "usehooks-ts";

const DELAY = 5000;

export default function App() {
  const [isOnline, setIsOnline] = useState(true);

  const playAudio = async () => {
    await invoke("handle_event", { action: "play" });
  };
  const stopAudio = async () => {
    await invoke("handle_event", { action: "stop" });
  };

  useEffect(() => {
    if (isOnline) {
      stopAudio();
    } else {
      playAudio();
    }
  }, [isOnline]);

  useInterval(async () => {
    try {
      const response = await http.fetch(
        `https://captive.apple.com/hotspot-detect.html?${Date.now()}`,
        {
          method: "GET",
          timeout: 2000,
          responseType: ResponseType.Text,
        }
      );
      setIsOnline(response.ok);
    } catch {
      setIsOnline(false);
    }
  }, DELAY);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white text-4xl gap-4 flex flex-col items-center justify-center">
      <p>{isOnline ? "✅ 在线" : "❌ 未连接"}</p>
    </div>
  );
}
