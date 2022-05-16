import { defineConfig } from 'vite'
import path from 'path';
import react from '@vitejs/plugin-react';
import webExtension from "@samrum/vite-plugin-web-extension";

const staticPath = 'static';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: {
        name: 'MCM Checker',
        description: 'MCM Checker',
        version: '0.0.1',
        manifest_version: 3,
        background: {
          service_worker: "src/background/serviceWorker.js",
        },
        action: {
          default_popup: "./src/index.html",
          default_title: "Open the popup"
        },
        permissions: [
          "activeTab",
          "tabCapture",
          "tabs"
        ]
      },
    })
  ],
  publicDir: "public"
})
