import "./App.css";

import { invoke, shell } from "@tauri-apps/api";
import { useEffect, useState } from "react";

import { useInterval } from "usehooks-ts";

export default function App() {
  const [value, setValue] = useState(0);
  const [offline, setOffline] = useState(false);

  const playAudio = async () => {
    await invoke("handle_event", { action: "play" });
  };

  const stopAudio = async () => {
    setOffline(false);
    await invoke("handle_event", { action: "stop" });
  };

  const ping = async () => {
    const command = new shell.Command("ping", ["www.baidu.com", "-t"], {
      encoding: "utf8",
    });

    command.stdout.on("data", (line) => {
      const matched = line.match(/=(\d+)ms/);
      if (matched) {
        setValue(matched[1]);
      } else {
        setValue(0);
      }
    });
    await command.spawn();
  };

  useEffect(() => {
    ping();
  }, []);

  useEffect(() => {
    const throttleTimer = setTimeout(() => {
      if (value == 0) {
        setOffline(true);
      }
    }, 1000);

    return () => {
      clearTimeout(throttleTimer);
    };
  }, [value]);

  useInterval(() => {
    if (offline) {
      playAudio();
    }
  }, 1000);

  let color = "text-white";
  if (value > 0 && value < 50) {
    color = "text-green-500";
  } else if (value > 50 && value < 100) {
    color = "text-amber-500";
  } else if (value >= 100 && value < 200) {
    color = "text-red-500";
  } else {
    color = "text-slate-500";
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white text-4xl gap-4 flex flex-col items-center justify-center">
      <p>
        {value > 0 ? "✅ 在线" : "❌ 未连接"}
        <span className={`ml-4 ${color}`}>{value}ms</span>
      </p>
      {offline && (
        <button
          onClick={stopAudio}
          className="border-4 border-current px-2 py-3 rounded-xl hover:bg-green-500"
        >
          ⏹停止声音
        </button>
      )}
    </div>
  );
}
