import esbuild from "esbuild";
import { EmbedFilePlugin } from "esbuild-plugin-embed";

(async () => {
  await esbuild.build({
    entryPoints: ["src/index.ts"],
    outfile: "dist/index.js",
    bundle: true,
    plugins: [
      EmbedFilePlugin({
        cwd: ".",
        match: (filePath) => filePath.match(/\.(?:wgsl|css)$/),
      }),
    ],
    platform: "node",
  });
})();
