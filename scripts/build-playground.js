const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

// Bundle the library for browser use
esbuild
  .build({
    entryPoints: ["lib/streamalicious.js"],
    bundle: true,
    outfile: "playground/streamalicious.bundle.js",
    format: "iife",
    globalName: "streamalicious",
    platform: "browser",
    minify: false,
    sourcemap: false,
  })
  .then(() => {
    console.log("✅ Playground bundle created: playground/streamalicious.bundle.js");
  })
  .catch((error) => {
    console.error("❌ Build failed:", error);
    process.exit(1);
  });
