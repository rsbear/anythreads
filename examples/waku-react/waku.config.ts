import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "waku/config";

export default defineConfig({
  vite: {
    server: {
      port: 3001,
    },
    plugins: [
      tailwindcss(),
      react({
        babel: {
          plugins: ["babel-plugin-react-compiler"],
        },
      }),
    ],
  },
});
