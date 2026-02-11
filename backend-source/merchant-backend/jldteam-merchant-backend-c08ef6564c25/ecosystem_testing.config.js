 module.exports = {
    apps: [{
        name: 'ctt-mv1-3002',
        script: "./bin/www",
        instances: "max",
        instances : 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
          env: {
            NODE_ENV: 'testing',
            PORT: 3002,
			S3_BUCKET_REGION:'ap-southeast-1',
			S3_BUCKET_NAME:'cttk',
            S3_BUCKET_ACCESS_KEY: 'AKIARJHRNHHLSZE5U23U',
            S3_BUCKET_SECRET_KEY: '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',
            API_URL: '51.75.251.104',
        },
    }]
};

 