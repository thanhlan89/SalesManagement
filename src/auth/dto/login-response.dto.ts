import { User } from '@prisma/client';

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: Omit<User, 'passwordHash'>;
}
