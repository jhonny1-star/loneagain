/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['64.31.43.190', 'gstaticontent.com', 'images-na.ssl-images-amazon.com', 'image.tmdb.org'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '64.31.43.190',
        port: '80',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.ssl-images-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'gstaticontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gstaticontent.com',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig 