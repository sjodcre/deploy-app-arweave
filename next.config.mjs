/** @type {import('next').NextConfig} */
// const nextConfig = {
//     reactStrictMode: false,
//     // trailingSlash: true,
//     swcMinify: false,
//     assetPrefix: '.',  // Ensure this is set correctly as we discussed earlier
//     output: 'export',  // Add this line to enable static export
//     images: {
//         domains: ['arweave.net'],
//         },
// }
const nextConfig =  {
  reactStrictMode: false,
  trailingSlash: true,
  assetPrefix: '/',
  swcMinify: false,
  output: 'export',
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = ['warp-contracts', 'warp-contracts-plugin-deploy', ...config.externals];
    }
    config.resolve.fallback = { fs: false, net: false, tls: false }; // Disable fs and other server-specific modules
    return config;
  },
};
  
export default nextConfig;

