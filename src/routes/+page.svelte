<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-8 text-center text-4xl font-bold text-gray-800">Environment Variables Demo</h1>

		<div class="grid gap-6 md:grid-cols-2">
			<!-- Dynamic Environment Variables -->
			<div class="rounded-lg bg-white p-6 shadow-lg">
				<h2 class="mb-4 flex items-center text-2xl font-semibold text-green-600">
					<span class="mr-2 h-3 w-3 rounded-full bg-green-500"></span>
					Dynamic Environment Variables
				</h2>
				<p class="mb-4 text-sm text-gray-600">
					These can change at runtime and are loaded from $env/dynamic/private
				</p>
				<div class="space-y-3">
					<div class="rounded bg-gray-50 p-3">
						<span class="font-medium text-gray-700">DYNAMIC_PUBLIC_KEY:</span>
						<span class="ml-2 font-mono text-blue-600">{data.envVars.dynamic.publicKey}</span>
					</div>
					<div class="rounded bg-gray-50 p-3">
						<span class="font-medium text-gray-700">DYNAMIC_PRIVATE_KEY:</span>
						<span class="ml-2 font-mono text-blue-600">{data.envVars.dynamic.privateKey}</span>
					</div>
				</div>
			</div>

			<!-- Static Environment Variables -->
			<div class="rounded-lg bg-white p-6 shadow-lg">
				<h2 class="mb-4 flex items-center text-2xl font-semibold text-purple-600">
					<span class="mr-2 h-3 w-3 rounded-full bg-purple-500"></span>
					Static Environment Variables
				</h2>
				<p class="mb-4 text-sm text-gray-600">
					These are set at build time and loaded from $env/static/private
				</p>
				<div class="space-y-3">
					<div class="rounded bg-gray-50 p-3">
						<span class="font-medium text-gray-700">STATIC_PUBLIC_KEY:</span>
						<span class="ml-2 font-mono text-purple-600">{data.envVars.static.publicKey}</span>
					</div>
					<div class="rounded bg-gray-50 p-3">
						<span class="font-medium text-gray-700">STATIC_PRIVATE_KEY:</span>
						<span class="ml-2 font-mono text-purple-600">{data.envVars.static.privateKey}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Server Information -->
		<div class="mt-6 rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-4 flex items-center text-2xl font-semibold text-orange-600">
				<span class="mr-2 h-3 w-3 rounded-full bg-orange-500"></span>
				Server Information
			</h2>
			<div class="grid gap-3 md:grid-cols-2">
				<div class="rounded bg-gray-50 p-3">
					<span class="font-medium text-gray-700">Server Timestamp:</span>
					<span class="ml-2 font-mono text-orange-600">{data.serverInfo.timestamp}</span>
				</div>
				<div class="rounded bg-gray-50 p-3">
					<span class="font-medium text-gray-700">Node Environment:</span>
					<span class="ml-2 font-mono text-orange-600">{data.serverInfo.nodeEnv}</span>
				</div>
			</div>
		</div>

		<!-- Information Card -->
		<div class="mt-6 border-l-4 border-yellow-400 bg-yellow-50 p-4">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm text-yellow-700">
						<strong>Security Note:</strong> These environment variables are being displayed for demonstration
						purposes. In a real application, never expose sensitive private keys or secrets to the client
						side.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
