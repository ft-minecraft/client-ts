// @ts-check

import esbuild from "esbuild";
import { EmbedFilePlugin } from "esbuild-plugin-embed";

const production = process.env.NODE_ENV === "production";

(async () => {
  await esbuild.build({
    minify: production,
    sourcemap: !production,
    entryPoints: ["src/index.ts"],
    outdir: "dist",
    splitting: true,
    bundle: true,
    format: "esm",
    define: {
      "process.env.NODE_ENV": production ? '"production"' : '"development"',
    },
    plugins: [
      EmbedFilePlugin({
        cwd: ".",
        match: (filePath) => !!filePath.match(/\.(?:wgsl|css)$/),
      }),
    ],
    platform: "node",
  });
})();
