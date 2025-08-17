import { JWT_SECRET } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token-payload.interface';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      secretOrKey: configService.getOrThrow(JWT_SECRET),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => request?.cookies.Authentication,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
    });
  }
  validate(tokenPayload: TokenPayload) {}
}
