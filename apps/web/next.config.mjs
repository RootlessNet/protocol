/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rootlessnet/sdk', '@rootlessnet/crypto'],
  serverExternalPackages: ['@noble/curves', '@noble/hashes', '@noble/ciphers'],
};

export default nextConfig;
