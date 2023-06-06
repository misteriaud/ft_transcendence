export interface Message {
	id: number;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	author: {
		user: {
			username: string;
			id: number;
			login42: string;
		};
	};
}

export interface Room {
	id: number;
	name: string;
	access: string;
}
