module.exports = {
  apps: [
    {
      name: "backend-elios",
      script: "dist/server.js",
      cwd: "./server",
      instances: 2,
      exec_mode: "cluster",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    },
    {
      name: "store",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 0.0.0.0",
      cwd: "./",
      interpreter: "node",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
