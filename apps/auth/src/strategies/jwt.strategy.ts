import { JWT_SECRET } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { UsersService } from '../users/users.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.getOrThrow<string>(JWT_SECRET),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request?.cookies.Authentication,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
    });
  }
  validate(tokenPayload: TokenPayload) {
    return this.usersService.getUser({ _id: tokenPayload.userId });
  }
}
