import type { NextConfig } from "next";

// Allows the dev server (HMR socket + JS chunks) to be reached from another
// device on the same Wi-Fi, e.g. testing on a phone. Dev-only — has no
// effect on production builds or the deployed site. The IP is machine/
// network-specific, so it lives in .env.local (gitignored) rather than
// here — set DEV_LAN_ORIGIN there to enable it; omitting it is fine, the
// dev server just won't be reachable from other devices.
const devLanOrigin = process.env.DEV_LAN_ORIGIN;

const nextConfig: NextConfig = {
  allowedDevOrigins: devLanOrigin ? [devLanOrigin] : [],
};

export default nextConfig;
