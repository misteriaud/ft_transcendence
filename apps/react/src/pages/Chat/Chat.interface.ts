export interface Message {
	id: number;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	author: {
		user: {
			id: number;
		};
	};
}

export interface Room {
	id: number;
	name: string;
	access: string;
	userId?: number;
}
