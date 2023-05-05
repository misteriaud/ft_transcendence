// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
	// create two dummy articles

	const spayeur = await prisma.user.upsert({
		where: { schoolId: 'spayeur' },
		update: {},
		create: {
			schoolId: 'spayeur',
			email: 'spayeur@student.42.fr',
			name: 'Stéphane Payeur',
		},
	});

	const jvermeer = await prisma.user.upsert({
		where: { schoolId: 'jvermeer' },
		update: {},
		create: {
			schoolId: 'jvermeer',
			email: 'jvermeer@student.42.fr',
			name: 'Jean Baptiste Vermeersch',
		},
	});

	const dpaccagn = await prisma.user.upsert({
		where: { schoolId: 'dpaccagn' },
		update: {},
		create: {
			schoolId: 'dpaccagn',
			email: 'dpaccagn@student.42.fr',
			name: 'Dimitri Paccagnini',
		},
	});

	const mriaud = await prisma.user.upsert({
		where: { schoolId: 'mriaud' },
		update: {},
		create: {
			schoolId: 'mriaud',
			email: 'maxime.riaud@gmail.com',
			name: 'Maxime Riaud',
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
