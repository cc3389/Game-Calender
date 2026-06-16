import type { NextConfig } from "next";

/**
 * 局域网 IP 访问 dev 时，Next.js 会校验 HMR / _next 资源的 Origin。
 * 见 https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
 */
const extraDevOrigins = (process.env.DEV_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    ...extraDevOrigins,
    "192.168.*.*",
    "10.*.*.*",
  ],
};

export default nextConfig;
