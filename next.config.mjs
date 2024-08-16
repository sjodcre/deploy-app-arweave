// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    trailingSlash: true,
    assetPrefix: '/',  // Ensure this is set correctly as we discussed earlier
    output: 'export',  // Add this line to enable static export
  }
  
  export default nextConfig;
  