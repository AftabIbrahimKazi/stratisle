import type { NextConfig } from "next";

// Allows the dev server (HMR socket + JS chunks) to be reached from another
// device on the same Wi-Fi, e.g. testing on a phone. Dev-only — has no
// effect on production builds or the deployed site. The IP is machine/
// network-specific, so it lives in .env.local (gitignored) rather than
// here — set DEV_LAN_ORIGIN there to enable it; omitting it is fine, the
// dev server just won't be reachable from other devices.
const devLanOrigin = process.env.DEV_LAN_ORIGIN;

// Setting allowedDevOrigins replaces Next's allow-list rather than
// extending it — omitting these local variants here previously broke
// 127.0.0.1 access even though only the LAN IP was ever intended to
// be added.
const LOCAL_DEV_ORIGINS = ["localhost", "127.0.0.1"];

const nextConfig: NextConfig = {
  allowedDevOrigins: devLanOrigin
    ? [...LOCAL_DEV_ORIGINS, devLanOrigin]
    : LOCAL_DEV_ORIGINS,
};

export default nextConfig;
