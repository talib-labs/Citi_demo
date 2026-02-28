/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // react-syntax-highlighter has type resolution issues with moduleResolution: bundler
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
