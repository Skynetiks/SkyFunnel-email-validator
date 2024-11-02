module.exports = {
	apps: [
		{
			name: 'skyfunnel-email-validator',
			script: './node_modules/.bin/tsx',
			args: "server.ts",
			watch: true,
			env_production: {
				NODE_ENV: 'production',
				PORT: 3000,
				// Add other environment variables here
			}
		},
		{
			name: 'skyfunnel-email-validator-worker',
			script: './node_modules/.bin/tsx',
			args: "worker.ts",
			exec_mode: 'cluster',
			watch: true,
			output: './logs/worker-out.log',
			error: './logs/worker-error.log',
			instances: 5,
			max_memory_restart: '100M',
			env_production: {
				NODE_ENV: 'production',
				// Add other environment variables here
			}
		}
	]
};
