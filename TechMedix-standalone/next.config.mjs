/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["three", "@react-three/fiber", "@react-three/drei", "three-stdlib", "zod"],
  outputFileTracingExcludes: {
    "/*": [
      "**/node_modules/three/**",
      "**/node_modules/@react-three/**",
      "**/node_modules/three-stdlib/**",
      "**/public/robots/**",
      "**/public/robots*/**",
      "**/.atlas/**",
    ],
  },
  turbopack: {
    root: import.meta.dirname,
  },
  async rewrites() {
    return [
      { source: '/about', destination: '/about.html' },
      { source: '/blackcat-grid', destination: '/blackcat-grid.html' },
      { source: '/habitat-landing', destination: '/habitat.html' },
      { source: '/certifications-landing', destination: '/certifications.html' },
    ];
  },
};

export default nextConfig;
