export interface Item {
	id: number;
	name: string;
	description: string | null;
	category: string;
	price: number; // Price in cents
	createdAt: string;
	updatedAt: string;
}
