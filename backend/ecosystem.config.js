module.exports = {
  apps: [
    {
      name: 'barrio-api',
      script: 'src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'barrio-sync',
      script: 'src/jobs/syncBuckets.js',
      cron_restart: '*/15 * * * *', // <--- Corre cada 15 min
      autorestart: false,
      watch: false
    }
  ]
};