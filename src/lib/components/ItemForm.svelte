<script lang="ts">
	import type { Item } from '../types';

	interface Props {
		item?: Item | null;
		onSubmit: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
		onCancel: () => void;
		isLoading?: boolean;
	}

	let { item = null, onSubmit, onCancel, isLoading = false }: Props = $props();

	let formData = $state({
		name: item?.name || '',
		description: item?.description || '',
		category: item?.category || '',
		price: item ? item.price / 100 : 0 // Convert from cents to dollars
	});

	let errors = $state({
		name: '',
		category: '',
		price: ''
	});

	const validateForm = () => {
		errors.name = formData.name.trim() ? '' : 'Name is required';
		errors.category = formData.category.trim() ? '' : 'Category is required';
		errors.price = formData.price > 0 ? '' : 'Price must be greater than 0';

		return !errors.name && !errors.category && !errors.price;
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		
		if (!validateForm()) {
			return;
		}

		try {
			await onSubmit({
				name: formData.name.trim(),
				description: formData.description.trim(),
				category: formData.category.trim(),
				price: formData.price
			});
		} catch (error) {
			console.error('Error submitting form:', error);
		}
	};

	const categories = [
		'Electronics',
		'Clothing',
		'Books',
		'Home & Garden',
		'Sports',
		'Toys',
		'Food & Beverages',
		'Other'
	];
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<div>
		<label for="name" class="block text-sm font-medium text-gray-700">Name *</label>
		<input
			id="name"
			type="text"
			bind:value={formData.name}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			class:border-red-500={errors.name}
			placeholder="Enter item name"
			disabled={isLoading}
		/>
		{#if errors.name}
			<p class="mt-1 text-sm text-red-600">{errors.name}</p>
		{/if}
	</div>

	<div>
		<label for="description" class="block text-sm font-medium text-gray-700">Description</label>
		<textarea
			id="description"
			bind:value={formData.description}
			rows="3"
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			placeholder="Enter item description (optional)"
			disabled={isLoading}
		></textarea>
	</div>

	<div>
		<label for="category" class="block text-sm font-medium text-gray-700">Category *</label>
		<select
			id="category"
			bind:value={formData.category}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			class:border-red-500={errors.category}
			disabled={isLoading}
		>
			<option value="">Select a category</option>
			{#each categories as category}
				<option value={category}>{category}</option>
			{/each}
		</select>
		{#if errors.category}
			<p class="mt-1 text-sm text-red-600">{errors.category}</p>
		{/if}
	</div>

	<div>
		<label for="price" class="block text-sm font-medium text-gray-700">Price ($) *</label>
		<input
			id="price"
			type="number"
			step="0.01"
			min="0"
			bind:value={formData.price}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			class:border-red-500={errors.price}
			placeholder="0.00"
			disabled={isLoading}
		/>
		{#if errors.price}
			<p class="mt-1 text-sm text-red-600">{errors.price}</p>
		{/if}
	</div>

	<div class="flex justify-end space-x-3 pt-4">
		<button
			type="button"
			onclick={onCancel}
			class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			disabled={isLoading}
		>
			Cancel
		</button>
		<button
			type="submit"
			class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
			disabled={isLoading}
		>
			{#if isLoading}
				<svg class="mr-2 inline h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
				{item ? 'Updating...' : 'Creating...'}
			{:else}
				{item ? 'Update Item' : 'Create Item'}
			{/if}
		</button>
	</div>
</form>
