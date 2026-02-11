module.exports = {
    apps: [{
        name: 'CTT-UB 3080',
        script: "./bin/www",
        instances: "max",
        exec_mode: "cluster",
        autorestart: true,
        max_restarts: 10,
        watch: false,
        max_memory_restart: '1G',
        env: {
            "PORT": 3080,
            "NODE_ENV": "development"
        },
        // env_production: {
        //     "PORT": 3080,
        //     "NODE_ENV": "production",
        // }
    }]
};