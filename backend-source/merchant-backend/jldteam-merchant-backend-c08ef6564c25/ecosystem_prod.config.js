module.exports = {
    apps: [{
        name: 'CTT-MB-PROD 3081',
        script: "./bin/www",
        instances: "max",
        exec_mode: "cluster",
        autorestart: true,
        max_restarts: 10,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            PORT: 3081,
            S3_BUCKET_REGION: 'ap-northeast-2',
            S3_BUCKET_NAME: 'ctt-seoul',
            S3_BUCKET_ACCESS_KEY: 'AKIAVFG2AEMURH7AUEVX',
            S3_BUCKET_SECRET_KEY: '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',
            API_URL: 'https://merchant.coupontalk.info',
        },
    }]
};