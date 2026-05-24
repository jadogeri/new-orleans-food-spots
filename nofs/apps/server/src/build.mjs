import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, cp } from "node:fs/promises";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { transform } from "@swc/core";
import { rm } from "node:fs/promises";

// Plugins may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * SWC esbuild plugin — replaces esbuild's built-in TypeScript loader with SWC
 * so that `experimentalDecorators` + `emitDecoratorMetadata` are honoured.
 */
const swcPlugin = {
  name: "swc-decorators",
  setup(build) {
    build.onLoad({ filter: /\.tsx?$/ }, async (args) => {
      if (args.path.endsWith(".d.ts")) return undefined;

      const source = await readFile(args.path, "utf8");
      const isTsx = args.path.endsWith(".tsx");

      const result = await transform(source, {
        filename: args.path,
        swcrc: false,
        jsc: {
          parser: {
            syntax: "typescript",
            decorators: true,
            tsx: isTsx,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
          target: "es2021",
        },
        // Keep ESM syntax so esbuild handles module-format conversion
        // itself via __esm with correct namespace objects. If we emit CJS here
        // esbuild still wraps it in __esm (original source was ESM) but then
        // SWC's `exports.x = ...` references the outer bundle `exports` instead
        // of the per-module namespace object, causing all named exports to be
        // undefined at runtime.
        module: { type: "nodenext" },
      });

      return { contents: result.code, loader: "js" };
    });
  },
};

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/main.ts")],
    platform: "node",
    bundle: true,
    format: "cjs",
    outdir: distDir,
    logLevel: "info",
    external: [
      "class-transformer",
      "class-validator",
      "@nestjs/microservices",
      "@nestjs/microservices/microservices-module",
      "@nestjs/websockets",
      "@nestjs/websockets/socket-module",
      "oslo",
      "@css-inline/css-inline",
      "@css-inline/*",
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "xxhash-addon",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "@libsql/darwin-arm64",
      "@libsql/darwin-x64",
      "@libsql/linux-x64-gnu",
      "@libsql/linux-x64-musl",
      "@libsql/linux-arm64-gnu",
      "@libsql/linux-arm64-musl",
      "@libsql/win32-x64-msvc",
      "oracledb",
      "mongodb-client-encryption",
      "nodemailer",
      "handlebars",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@swc/*",
      "@aws-sdk/*",
      "@azure/*",
      // "@opentelemetry/*", // kept bundled so better-auth works without runtime dep
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "@tree-sitter/*",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "ffi-napi",
      "grpc",
      "hiredis",
      "kerberos",
      "leveldown",
      "miniflare",
      "mysql2",
      "newrelic",
      "odbc",
      "piscina",
      "realm",
      "ref-napi",
      "rocksdb",
      "sass-embedded",
      "sequelize",
      "serialport",
      "snappy",
      "tinypool",
      "usb",
      "workerd",
      "wrangler",
      "zeromq",
      "zeromq-prebuilt",
      "playwright",
      "puppeteer",
      "puppeteer-core",
      "electron",
    ],
    sourcemap: "linked",
    plugins: [
      swcPlugin,
      esbuildPluginPino({ transports: ["pino-pretty"] }),
    ],
  });
}

async function copyTemplates() {
  const src = path.resolve(artifactDir, "src/mail/templates");
  const dest = path.resolve(artifactDir, "dist/mail/templates");
  await cp(src, dest, { recursive: true });
}

buildAll()
  .then(copyTemplates)
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
