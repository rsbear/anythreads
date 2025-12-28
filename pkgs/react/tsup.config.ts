import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["csr/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
});
