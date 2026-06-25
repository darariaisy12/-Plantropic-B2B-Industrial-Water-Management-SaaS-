module.exports = {
  apps: [
    {
      name: 'plantropic-4028',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'dev -p 4028',
      interpreter: '/opt/homebrew/bin/node',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
