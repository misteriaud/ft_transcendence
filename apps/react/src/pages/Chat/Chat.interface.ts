export interface Message {
	id: number;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	author: {
		user: {
			username: string;
			id: number;
		};
	};
}

export interface Room {
	id: number;
	name: string;
	access: string;
}
