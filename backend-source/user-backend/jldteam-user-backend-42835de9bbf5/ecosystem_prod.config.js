module.exports = {
  apps: [{
    name: 'CTT-UB-PROD 3080',
    script: "./bin/www",
    instances: "max",
    exec_mode: "cluster",
    autorestart: true,
    max_restarts: 10,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3080,
    },
  }]
};