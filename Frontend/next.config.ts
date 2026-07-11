import type { NextConfig } from "next";
import path from "node:path";
import os from "node:os";

const isDev = process.env.NODE_ENV === "development";

const cacheDir =
  process.env.NEXT_DIST_DIR ??
  (isDev ? path.join(os.homedir(), ".cache", "seedqura-next") : ".next");

const nextConfig: NextConfig = {
  output: "standalone",
  // Dev cache on local disk — external drives (T7) corrupt .next after HMR.
  distDir: cacheDir,
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["**/node_modules/**", "**/.git/**"],
      };
    }
    return config;
  },
};

export default nextConfig;
