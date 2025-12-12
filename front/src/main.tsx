import './index.css'
import { createRoot } from 'react-dom/client'
import { App } from "./App";

import { init, isTMA, viewport } from "@tma.js/sdk";

const enableTelegramFullscreen = async () => {
  try {
    init();
    await viewport.mount();
    await viewport.requestFullscreen();
  } catch (error) {
    console.error("Failed to enable Telegram fullscreen", error);
  }
};

if (isTMA()) {
    enableTelegramFullscreen();
};

createRoot(document.getElementById("root")!).render(<App />);
