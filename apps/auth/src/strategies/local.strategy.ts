import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly usersService: UsersService) {
    super({
      usernameField: 'email',
    });
  }
  async validate(email: string, password: string) {
    try {
      return await this.usersService.validateUser(email, password);
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }
}
