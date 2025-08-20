import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { UsersService } from '../users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) =>
          request?.cookies?.Authentication || request?.Authentication,
        // rpc request "data payload"
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
    });
  }
  validate(tokenPayload: TokenPayload) {
    try {
      return this.usersService.getUser({ _id: tokenPayload.userId });
    } catch (err) {
      throw new UnauthorizedException('credentials could be wronge');
    }
  }
}
