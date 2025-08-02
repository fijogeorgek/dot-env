<script lang="ts">
	import type { PageData } from './$types';
	import type { Item } from '$lib/types';
	import Dialog from '$lib/components/Dialog.svelte';
	import ItemForm from '$lib/components/ItemForm.svelte';
	import ItemsTable from '$lib/components/ItemsTable.svelte';

	let { data }: { data: PageData } = $props();

	// Items state
	let items = $state<Item[]>(data.items || []);
	let isLoading = $state(false);

	// Dialog state
	let showAddDialog = $state(false);
	let showEditDialog = $state(false);
	let showDeleteDialog = $state(false);
	let selectedItem = $state<Item | null>(null);

	// API functions
	const fetchItems = async () => {
		isLoading = true;
		try {
			const response = await fetch('/api/items');
			if (response.ok) {
				items = await response.json();
			}
		} catch (error) {
			console.error('Error fetching items:', error);
		} finally {
			isLoading = false;
		}
	};

	const createItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
		try {
			const response = await fetch('/api/items', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(itemData)
			});

			if (response.ok) {
				await fetchItems();
				showAddDialog = false;
			} else {
				const error = await response.json();
				alert(error.error || 'Failed to create item');
			}
		} catch (error) {
			console.error('Error creating item:', error);
			alert('Failed to create item');
		}
	};

	const updateItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
		if (!selectedItem) return;

		try {
			const response = await fetch('/api/items', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: selectedItem.id, ...itemData })
			});

			if (response.ok) {
				await fetchItems();
				showEditDialog = false;
				selectedItem = null;
			} else {
				const error = await response.json();
				alert(error.error || 'Failed to update item');
			}
		} catch (error) {
			console.error('Error updating item:', error);
			alert('Failed to update item');
		}
	};

	const deleteItem = async () => {
		if (!selectedItem) return;

		try {
			const response = await fetch('/api/items', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: selectedItem.id })
			});

			if (response.ok) {
				await fetchItems();
				showDeleteDialog = false;
				selectedItem = null;
			} else {
				const error = await response.json();
				alert(error.error || 'Failed to delete item');
			}
		} catch (error) {
			console.error('Error deleting item:', error);
			alert('Failed to delete item');
		}
	};

	// Event handlers
	const handleAddItem = () => {
		showAddDialog = true;
	};

	const handleEditItem = (item: Item) => {
		selectedItem = item;
		showEditDialog = true;
	};

	const handleDeleteItem = (item: Item) => {
		selectedItem = item;
		showDeleteDialog = true;
	};

	const closeDialogs = () => {
		showAddDialog = false;
		showEditDialog = false;
		showDeleteDialog = false;
		selectedItem = null;
	};
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

		<!-- Items Management Section -->
		<div class="mt-6 rounded-lg bg-white p-6 shadow-lg">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="flex items-center text-2xl font-semibold text-indigo-600">
					<span class="mr-2 h-3 w-3 rounded-full bg-indigo-500"></span>
					Items Management
				</h2>
				<button
					onclick={handleAddItem}
					class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
				>
					<svg class="mr-2 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Add Item
				</button>
			</div>

			<ItemsTable {items} {isLoading} onEdit={handleEditItem} onDelete={handleDeleteItem} />
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

<!-- Add Item Dialog -->
<Dialog bind:open={showAddDialog} title="Add New Item" onClose={closeDialogs}>
	<ItemForm onSubmit={createItem} onCancel={closeDialogs} />
</Dialog>

<!-- Edit Item Dialog -->
<Dialog bind:open={showEditDialog} title="Edit Item" onClose={closeDialogs}>
	<ItemForm item={selectedItem} onSubmit={updateItem} onCancel={closeDialogs} />
</Dialog>

<!-- Delete Confirmation Dialog -->
<Dialog bind:open={showDeleteDialog} title="Delete Item" onClose={closeDialogs}>
	<div class="space-y-4">
		<p class="text-sm text-gray-600">
			Are you sure you want to delete "<strong>{selectedItem?.name}</strong>"? This action cannot be
			undone.
		</p>
		<div class="flex justify-end space-x-3">
			<button
				onclick={closeDialogs}
				class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
			>
				Cancel
			</button>
			<button
				onclick={deleteItem}
				class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
			>
				Delete
			</button>
		</div>
	</div>
</Dialog>
