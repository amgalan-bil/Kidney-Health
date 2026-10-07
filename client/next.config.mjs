/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // The browser always calls this site's own /api/v1 (see src/lib/api.ts), and
    // this rewrite forwards it to the Express API. One origin keeps the session
    // cookie first-party, which mobile Safari requires, and avoids CORS entirely.
    // API_PROXY_TARGET wins over NEXT_PUBLIC_API_URL; production falls back to Render.
    const target =
      process.env.API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://kidney-health-xvqo.onrender.com'
        : 'http://localhost:4000');
    return [
      {
        source: '/api/v1/:path*',
        destination: `${target.replace(/\/+$/, '')}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
