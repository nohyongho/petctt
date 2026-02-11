module.exports = {
  apps: [{
    name: 'CTT-UB-Ads-Marker-TEST 3081',
    script: "./bin/www",
    instances: "max",
    exec_mode: "cluster",
    autorestart: true,
    max_restarts: 10,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'testing',
      PORT: 3080,
    },
  }]
};