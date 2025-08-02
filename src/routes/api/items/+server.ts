import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { items } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { log, logError, generateRequestId } from '$lib/server/axiom';
import type { RequestHandler } from './$types';

// GET - Fetch all items
export const GET: RequestHandler = async ({ request }) => {
	const requestId = generateRequestId();
	const startTime = Date.now();

	log.request('Fetching all items', {
		method: 'GET',
		url: request.url,
		requestId,
		userAgent: request.headers.get('user-agent') || undefined
	});

	try {
		const allItems = await db.select().from(items).orderBy(items.createdAt);

		const duration = Date.now() - startTime;
		log.response('Successfully fetched items', {
			method: 'GET',
			url: request.url,
			requestId,
			status: 200,
			duration,
			itemCount: allItems.length
		});

		return json(allItems);
	} catch (error) {
		const duration = Date.now() - startTime;
		logError(error as Error, {
			requestId,
			method: 'GET',
			url: request.url,
			operation: 'fetch_items',
			duration
		});

		log.response('Failed to fetch items', {
			method: 'GET',
			url: request.url,
			requestId,
			status: 500,
			duration
		});

		return json({ error: 'Failed to fetch items' }, { status: 500 });
	}
};

// POST - Create new item
export const POST: RequestHandler = async ({ request }) => {
	const requestId = generateRequestId();
	const startTime = Date.now();

	log.request('Creating new item', {
		method: 'POST',
		url: request.url,
		requestId,
		userAgent: request.headers.get('user-agent') || undefined
	});

	try {
		const body = await request.json();
		const { name, description, category, price } = body;

		if (!name || !category || price === undefined) {
			const duration = Date.now() - startTime;
			log.warn('Invalid request data for item creation', {
				requestId,
				method: 'POST',
				url: request.url,
				missingFields: {
					name: !name,
					category: !category,
					price: price === undefined
				},
				duration
			});

			log.response('Bad request - missing required fields', {
				method: 'POST',
				url: request.url,
				requestId,
				status: 400,
				duration
			});

			return json({ error: 'Name, category, and price are required' }, { status: 400 });
		}

		const itemData = {
			name,
			description: description || null,
			category,
			price: Math.round(price * 100), // Convert to cents
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const result = await db
			.insert(items)
			.values(itemData);

		// MySQL doesn't support RETURNING, so we need to fetch the inserted item
		const newItem = await db
			.select()
			.from(items)
			.where(eq(items.id, result[0].insertId));

		const duration = Date.now() - startTime;
		log.database('Item created successfully', {
			operation: 'insert',
			table: 'items',
			requestId,
			duration,
			rowsAffected: 1,
			itemId: newItem[0].id
		});

		log.response('Successfully created item', {
			method: 'POST',
			url: request.url,
			requestId,
			status: 201,
			duration,
			itemId: newItem[0].id
		});

		return json(newItem[0], { status: 201 });
	} catch (error) {
		const duration = Date.now() - startTime;
		logError(error as Error, {
			requestId,
			method: 'POST',
			url: request.url,
			operation: 'create_item',
			duration
		});

		log.response('Failed to create item', {
			method: 'POST',
			url: request.url,
			requestId,
			status: 500,
			duration
		});

		return json({ error: 'Failed to create item' }, { status: 500 });
	}
};

// PUT - Update item
export const PUT: RequestHandler = async ({ request }) => {
	const requestId = generateRequestId();
	const startTime = Date.now();

	log.request('Updating item', {
		method: 'PUT',
		url: request.url,
		requestId,
		userAgent: request.headers.get('user-agent') || undefined
	});

	try {
		const body = await request.json();
		const { id, name, description, category, price } = body;

		if (!id || !name || !category || price === undefined) {
			const duration = Date.now() - startTime;
			log.warn('Invalid request data for item update', {
				requestId,
				method: 'PUT',
				url: request.url,
				missingFields: {
					id: !id,
					name: !name,
					category: !category,
					price: price === undefined
				},
				duration
			});

			log.response('Bad request - missing required fields', {
				method: 'PUT',
				url: request.url,
				requestId,
				status: 400,
				duration
			});

			return json({ error: 'ID, name, category, and price are required' }, { status: 400 });
		}

		const updateData = {
			name,
			description: description || null,
			category,
			price: Math.round(price * 100), // Convert to cents
			updatedAt: new Date()
		};

		await db
			.update(items)
			.set(updateData)
			.where(eq(items.id, id));

		// MySQL doesn't support RETURNING, so we need to fetch the updated item
		const updatedItem = await db
			.select()
			.from(items)
			.where(eq(items.id, id));

		const duration = Date.now() - startTime;

		if (updatedItem.length === 0) {
			log.warn('Item not found for update', {
				requestId,
				method: 'PUT',
				url: request.url,
				itemId: id,
				duration
			});

			log.response('Item not found', {
				method: 'PUT',
				url: request.url,
				requestId,
				status: 404,
				duration
			});

			return json({ error: 'Item not found' }, { status: 404 });
		}

		log.database('Item updated successfully', {
			operation: 'update',
			table: 'items',
			requestId,
			duration,
			rowsAffected: 1,
			itemId: id
		});

		log.response('Successfully updated item', {
			method: 'PUT',
			url: request.url,
			requestId,
			status: 200,
			duration,
			itemId: id
		});

		return json(updatedItem[0]);
	} catch (error) {
		const duration = Date.now() - startTime;
		logError(error as Error, {
			requestId,
			method: 'PUT',
			url: request.url,
			operation: 'update_item',
			duration
		});

		log.response('Failed to update item', {
			method: 'PUT',
			url: request.url,
			requestId,
			status: 500,
			duration
		});

		return json({ error: 'Failed to update item' }, { status: 500 });
	}
};

// DELETE - Delete item
export const DELETE: RequestHandler = async ({ request }) => {
	const requestId = generateRequestId();
	const startTime = Date.now();

	log.request('Deleting item', {
		method: 'DELETE',
		url: request.url,
		requestId,
		userAgent: request.headers.get('user-agent') || undefined
	});

	try {
		const body = await request.json();
		const { id } = body;

		if (!id) {
			const duration = Date.now() - startTime;
			log.warn('Invalid request data for item deletion', {
				requestId,
				method: 'DELETE',
				url: request.url,
				missingFields: { id: true },
				duration
			});

			log.response('Bad request - ID required', {
				method: 'DELETE',
				url: request.url,
				requestId,
				status: 400,
				duration
			});

			return json({ error: 'ID is required' }, { status: 400 });
		}

		// First fetch the item to return it
		const itemToDelete = await db
			.select()
			.from(items)
			.where(eq(items.id, id));

		if (itemToDelete.length === 0) {
			const duration = Date.now() - startTime;
			log.warn('Item not found for deletion', {
				requestId,
				method: 'DELETE',
				url: request.url,
				itemId: id,
				duration
			});

			log.response('Item not found', {
				method: 'DELETE',
				url: request.url,
				requestId,
				status: 404,
				duration
			});

			return json({ error: 'Item not found' }, { status: 404 });
		}

		// MySQL doesn't support RETURNING, so we delete after fetching
		await db.delete(items).where(eq(items.id, id));

		const duration = Date.now() - startTime;

		log.database('Item deleted successfully', {
			operation: 'delete',
			table: 'items',
			requestId,
			duration,
			rowsAffected: 1,
			itemId: id
		});

		log.response('Successfully deleted item', {
			method: 'DELETE',
			url: request.url,
			requestId,
			status: 200,
			duration,
			itemId: id
		});

		return json(itemToDelete[0]);
	} catch (error) {
		const duration = Date.now() - startTime;
		logError(error as Error, {
			requestId,
			method: 'DELETE',
			url: request.url,
			operation: 'delete_item',
			duration
		});

		log.response('Failed to delete item', {
			method: 'DELETE',
			url: request.url,
			requestId,
			status: 500,
			duration
		});

		return json({ error: 'Failed to delete item' }, { status: 500 });
	}
};
