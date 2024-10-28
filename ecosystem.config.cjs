module.exports = {
	apps: [
		{
			name: 'skyfunnel-email-validator',
			script: './dist/server.js',
			watch: true,
			env_production: {
				NODE_ENV: 'production',
				PORT: 3000,
				// Add other environment variables here
			}
		},
		{
			name: 'skyfunnel-email-validator-worker',
			script: './dist/worker.js',
			watch: true,
			env_production: {
				NODE_ENV: 'production',
				// Add other environment variables here
			}
		}
	]
};
