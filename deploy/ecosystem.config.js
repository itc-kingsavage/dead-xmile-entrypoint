module.exports = {
    apps: [
        {
            name: "dead-xmile-entrypoint",
            script: "./src/server.js",
            exec_mode: "fork",
            instances: 1,
            watch: false,
            autorestart: true,
            env: {
                NODE_ENV: "production",
                PORT: 3000
            }
        }
    ]
};
