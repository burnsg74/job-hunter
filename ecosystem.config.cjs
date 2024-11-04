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
    }
  ],
}
