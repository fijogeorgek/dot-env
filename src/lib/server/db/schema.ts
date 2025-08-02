import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const items = mysqlTable('items', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 255 }).notNull(),
	description: varchar('description', { length: 1000 }),
	category: varchar('category', { length: 100 }).notNull(),
	price: int('price').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});