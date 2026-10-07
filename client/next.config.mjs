/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Set API_PROXY_TARGET (e.g. http://localhost:5050) to serve the Express API
    // from this same origin under /api/v1. Used when the site is shared through a
    // single public tunnel: one origin means the session cookie stays first-party
    // and there is no cross-origin request to allow. Unset in normal local dev,
    // where the browser talks to the API directly via NEXT_PUBLIC_API_URL.
    const target = process.env.API_PROXY_TARGET;
    if (!target) return [];
    return [
      {
        source: '/api/v1/:path*',
        destination: `${target.replace(/\/+$/, '')}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
