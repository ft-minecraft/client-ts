// @ts-check

import esbuild from "esbuild";
import { EmbedFilePlugin } from "esbuild-plugin-embed";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { exit } from "node:process";

const production = process.env.NODE_ENV === "production";

(async () => {
  const mainResult = await esbuild.build({
    minify: production,
    sourcemap: !production,
    entryPoints: ["src/main/index.ts"],
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
    platform: "browser",
    write: false,
  });

  if (mainResult.errors.length || mainResult.warnings.length) {
    console.log(mainResult);
    exit(1);
  }

  for (const file of mainResult.outputFiles) {
    await mkdir(dirname(file.path), { recursive: true });
    writeFile(file.path, file.contents);
  }

  const dist = resolve("dist");
  /**
   * @param {String} filePath
   */
  function toWebPath(filePath) {
    return `/${filePath.replace(dist, "").replace(/\\/g, "/")}`.replace(
      /^\/\//,
      "/"
    );
  }

  const swResult = await esbuild.build({
    minify: production,
    sourcemap: !production,
    entryPoints: ["src/sw/sw.ts"],
    outfile: "dist/sw.js",
    splitting: false,
    bundle: true,
    format: "esm",
    define: {
      "process.env.NODE_ENV": production ? '"production"' : '"development"',
      swFilePaths: JSON.stringify(
        mainResult.outputFiles.map((file) => toWebPath(file.path))
      ),
      swCacheName: `"${new Date().toISOString()}"`,
    },
    platform: "browser",
    write: true,
  });

  if (swResult.errors.length || swResult.warnings.length) {
    console.log(swResult);
    exit(1);
  }
})();
