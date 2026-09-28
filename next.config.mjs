const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  assetPrefix: isProd ? "/tools" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
