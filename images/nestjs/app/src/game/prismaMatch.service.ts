import { Injectable } from '@nestjs/common';
import { e_match_mod, e_match_state } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrismaMatchService {
	constructor(private prisma: PrismaService) {}

	// MATCH

	// Create a match
	async create(id: string, player1_id: number, player2_id: number, score1: number, score2: number, mod: e_match_mod, state: e_match_state) {
		return await this.prisma.match.create({
			data: {
				id,
				playedBy: {
					connect: [
						{
							id: player1_id,
						},
						{
							id: player2_id,
						},
					],
				},
				player1id: player1_id,
				score1: score1,
				score2: score2,
				mod: mod,
				state: state,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			select: {
				playedBy: {
					select: {
						id: true,
						username: true,
						login42: true,
						avatar: true,
						status: true,
					},
				},
				score1: true,
				score2: true,
				mod: true,
				state: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	// Get a match
	async get(id: string) {
		return await this.prisma.match.findUnique({
			where: {
				id,
			},
			select: {
				playedBy: {
					select: {
						id: true,
						username: true,
						login42: true,
						avatar: true,
						status: true,
					},
				},
				player1id: true,
				score1: true,
				score2: true,
				mod: true,
				state: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	// Edit a match
	//async edit(match_id: number, player1_id: number, player2_id: number, score1: number, score2: number, mod: e_match_mod, state: e_match_state) {
	//	return await this.prisma.match.update({
	//		where: {
	//			id: match_id,
	//		},
	//		data: {
	//			playedBy: {
	//				connect: [
	//					{
	//						id: player1_id,
	//					},
	//					{
	//						id: player2_id,
	//					},
	//				],
	//			},
	//			score1: score1,
	//			score2: score2,
	//			mod: mod,
	//			state: state,
	//			createdAt: new Date(),
	//			updatedAt: new Date(),
	//		},
	//		select: {
	//			playedBy: {
	//				select: {
	//					id: true,
	//					username: true,
	//					login42: true,
	//					avatar: true,
	//					status: true,
	//				},
	//			},
	//			score1: true,
	//			score2: true,
	//			mod: true,
	//			state: true,
	//			createdAt: true,
	//			updatedAt: true,
	//		},
	//	});
	//}

	// Delete a match
	//async delete(match_id: number) {
	//	await this.prisma.match.delete({
	//		where: {
	//			id: match_id,
	//		},
	//	});
	//}
}
