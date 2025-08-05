<script lang="ts">
	import type { Item } from '../types';

	interface Props {
		items: Item[];
		onEdit: (item: Item) => void;
		onDelete: (item: Item) => void;
		isLoading?: boolean;
	}

	let { items, onEdit, onDelete, isLoading = false }: Props = $props();

	const formatPrice = (priceInCents: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(priceInCents / 100);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};
</script>

<div class="overflow-hidden rounded-lg bg-white shadow">
	<div class="overflow-x-auto">
		<table class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
				<tr>
					<th
						class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
					>
						Name
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
					>
						Category
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
					>
						Price
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
					>
						Created
					</th>
					<th
						class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
					>
						Actions
					</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 bg-white">
				{#if isLoading}
					<tr>
						<td colspan="5" class="px-6 py-12 text-center">
							<div class="flex items-center justify-center">
								<svg class="mr-3 h-5 w-5 animate-spin text-gray-400" viewBox="0 0 24 24">
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
										fill="none"
									/>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								<span class="text-sm text-gray-500">Loading items...</span>
							</div>
						</td>
					</tr>
				{:else if items.length === 0}
					<tr>
						<td colspan="5" class="px-6 py-12 text-center">
							<div class="text-gray-500">
								<svg
									class="mx-auto h-12 w-12 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
									/>
								</svg>
								<h3 class="mt-2 text-sm font-medium text-gray-900">No items</h3>
								<p class="mt-1 text-sm text-gray-500">Get started by creating a new item.</p>
							</div>
						</td>
					</tr>
				{:else}
					{#each items as item (item.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4">
								<div>
									<div class="text-sm font-medium text-gray-900">{item.name}</div>
									{#if item.description}
										<div class="text-sm text-gray-500">{item.description}</div>
									{/if}
								</div>
							</td>
							<td class="px-6 py-4">
								<span
									class="inline-flex rounded-full bg-blue-100 px-2 text-xs leading-5 font-semibold text-blue-800"
								>
									{item.category}
								</span>
							</td>
							<td class="px-6 py-4 text-sm text-gray-900">
								{formatPrice(item.price)}
							</td>
							<td class="px-6 py-4 text-sm text-gray-500">
								{formatDate(item.createdAt)}
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium">
								<div class="flex justify-end space-x-2">
									<!-- svelte-ignore a11y_consider_explicit_label -->
									<button
										onclick={() => onEdit(item)}
										class="text-blue-600 hover:text-blue-900"
										title="Edit item"
									>
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											/>
										</svg>
									</button>
									<!-- svelte-ignore a11y_consider_explicit_label -->
									<button
										onclick={() => onDelete(item)}
										class="text-red-600 hover:text-red-900"
										title="Delete item"
									>
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</div>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
