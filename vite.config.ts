import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import { CommitHashPlugin } from "vite-plugin-commit-hash"
import { VitePWA } from "vite-plugin-pwa"
import svgr from "vite-plugin-svgr"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
    CommitHashPlugin({ noPrefix: false, noVirtual: false }),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        // The ffmpeg.wasm core is ~32MB and only loads for WMA playback —
        // keep it out of the precache manifest so it's fetched on demand.
        globIgnores: ["**/ffmpeg-core*.wasm", "**/ffmpeg-core*.js"],
      },
    }),
  ],
  // ffmpeg.wasm uses `new Worker(new URL("./worker.js", import.meta.url))`
  // internally. Vite's dep pre-bundler breaks that worker URL resolution and
  // causes the worker request to hang in dev. Excluding these packages keeps
  // the package's own file structure intact.
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
})
