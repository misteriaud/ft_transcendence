// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
	// create two dummy articles

	const spayeur = await prisma.user.upsert({
		where: { login42: 'spayeur' },
		update: {},
		create: {
			login42: 'spayeur',
			username: 'Stéphane Payeur',
		},
	});

	const jvermeer = await prisma.user.upsert({
		where: { login42: 'jvermeer' },
		update: {},
		create: {
			login42: 'jvermeer',
			username: 'Jean Baptiste Vermeersch',
		},
	});

	const dpaccagn = await prisma.user.upsert({
		where: { login42: 'dpaccagn' },
		update: {},
		create: {
			login42: 'dpaccagn',
			username: 'Dimitri Paccagnini',
		},
	});

	const mriaud = await prisma.user.upsert({
		where: { login42: 'mriaud' },
		update: {},
		create: {
			login42: 'mriaud',
			username: 'Maxime Riaud',
		},
	});

	console.log({ spayeur, jvermeer, dpaccagn, mriaud });
}

// execute the main function
main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		// close Prisma Client at the end
		await prisma.$disconnect();
	});
