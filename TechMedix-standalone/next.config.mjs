/** @type {import('next').NextConfig} */
const nextConfig = {
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
