import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: false,
  entry: ["src/index.ts"],
  format: ["esm"],
  minify: true,
  outDir: "dist",
  sourcemap: true,
})
