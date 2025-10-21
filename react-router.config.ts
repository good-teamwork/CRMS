import type { Config } from '@react-router/dev/config';

export default {
	appDirectory: './src/app',
	ssr: true,
	prerender: ['/*?'],
	serverBuildFile: 'index.js',
	serverPlatform: 'node',
	serverModuleFormat: 'esm',
} satisfies Config;
