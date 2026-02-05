import { execSync } from "node:child_process";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  clearScreen: false,
  base: "./",
  server: {
    proxy: {
      "/api": "http://localhost:8482",
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(resolveAppVersion()),
  },
  plugins: [react(), svgr(), markdown()],
});

function resolveAppVersion() {
  if (process.env.APP_VERSION) {
    return process.env.APP_VERSION;
  }

  const baseVersion = "0.0.0-dev";
  try {
    const hash = execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (hash) {
      return `${baseVersion}+${hash}`;
    }
  } catch {
    // Ignore git failures and fall back to the base dev version
  }
  return baseVersion;
}

function markdown(): Plugin {
  return {
    name: "markdown-loader",
    transform(code, id) {
      if (id.slice(-3) === ".md") {
        return `export default ${JSON.stringify(code)}`;
      }
    },
  };
}
