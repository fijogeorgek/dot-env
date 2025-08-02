import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { items } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// GET - Fetch all items
export const GET: RequestHandler = async () => {
	try {
		const allItems = await db.select().from(items).orderBy(items.createdAt);
		return json(allItems);
	} catch (error) {
		console.error('Error fetching items:', error);
		return json({ error: 'Failed to fetch items' }, { status: 500 });
	}
};

// POST - Create new item
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { name, description, category, price } = body;

		if (!name || !category || price === undefined) {
			return json({ error: 'Name, category, and price are required' }, { status: 400 });
		}

		const newItem = await db
			.insert(items)
			.values({
				name,
				description: description || null,
				category,
				price: Math.round(price * 100), // Convert to cents
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			})
			.returning();

		return json(newItem[0], { status: 201 });
	} catch (error) {
		console.error('Error creating item:', error);
		return json({ error: 'Failed to create item' }, { status: 500 });
	}
};

// PUT - Update item
export const PUT: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { id, name, description, category, price } = body;

		if (!id || !name || !category || price === undefined) {
			return json({ error: 'ID, name, category, and price are required' }, { status: 400 });
		}

		const updatedItem = await db
			.update(items)
			.set({
				name,
				description: description || null,
				category,
				price: Math.round(price * 100), // Convert to cents
				updatedAt: new Date().toISOString()
			})
			.where(eq(items.id, id))
			.returning();

		if (updatedItem.length === 0) {
			return json({ error: 'Item not found' }, { status: 404 });
		}

		return json(updatedItem[0]);
	} catch (error) {
		console.error('Error updating item:', error);
		return json({ error: 'Failed to update item' }, { status: 500 });
	}
};

// DELETE - Delete item
export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { id } = body;

		if (!id) {
			return json({ error: 'ID is required' }, { status: 400 });
		}

		const deletedItem = await db.delete(items).where(eq(items.id, id)).returning();

		if (deletedItem.length === 0) {
			return json({ error: 'Item not found' }, { status: 404 });
		}

		return json({ message: 'Item deleted successfully' });
	} catch (error) {
		console.error('Error deleting item:', error);
		return json({ error: 'Failed to delete item' }, { status: 500 });
	}
};
