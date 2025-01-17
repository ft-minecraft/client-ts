// @ts-check

import esbuild from "esbuild";
import { EmbedFilePlugin } from "esbuild-plugin-embed";

(async () => {
  await esbuild.build({
    minify: process.env.NODE_ENV === "production",
    sourcemap: process.env.NODE_ENV === "development",
    entryPoints: ["src/index.ts"],
    outdir: "dist",
    splitting: true,
    bundle: true,
    format: "esm",
    plugins: [
      EmbedFilePlugin({
        cwd: ".",
        match: (filePath) => !!filePath.match(/\.(?:wgsl|css)$/),
      }),
    ],
    platform: "node",
  });
})();
