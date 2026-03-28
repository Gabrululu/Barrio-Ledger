/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // CORS para consumidores externos de la API (fintechs, integraciones)
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-Key" },
        ]
      }
    ]
  }
};

export default nextConfig;
