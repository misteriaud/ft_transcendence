import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}
	async signup(dto: AuthDto) {
		const hash = await argon.hash(dto.password);

		try {
			const user = await this.prisma.user.create({
				data: {
					username: dto.username,
					login42: dto.login42,
					email: dto.email,
					hash: hash,
				},
			});
			return this.signToken(user.id, user.email);
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ConflictException('Credentials taken');
				}
			}
			throw error;
		}
	}

	async signin(dto: AuthDto) {
		const user = await this.prisma.user.findUnique({
			where: {
				login42: dto.login42,
			},
		});
		if (!user) {
			throw new UnauthorizedException('Credentials incorrect');
		}

		const match = await argon.verify(user.hash, dto.password);
		if (!match) {
			throw new UnauthorizedException('Credentials incorrect');
		}
		return this.signToken(user.id, user.email);
	}

	async signToken(userId: number, email: string): Promise<{ access_token: string }> {
		const payload = {
			sub: userId,
			email: email,
		};

		const token = await this.jwt.signAsync(payload, {
			expiresIn: '4h',
			secret: this.config.get('JWT_SECRET'),
		});

		return {
			access_token: token,
		};
	}
}
