module.exports = {
  apps: [
    {
      name: "jobs",
      script: "build/index.js",
      instances: 1,
      watch: false,
      exec_mode: "cluster",
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: 3011
      }
    },
    {
      name: "jobs-ws",
      script: "ws-server.js",
      instances: 1,
      watch: false,
      exec_mode: "cluster",
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        WS_PORT: 3012,
        ORIGIN: "https://jobs.localhost"
      }
    }
  ],
}
