const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig