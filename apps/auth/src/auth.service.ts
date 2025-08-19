import { Injectable } from '@nestjs/common';
import { UserDocument } from './users/model/user.schema';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  async login(user: UserDocument) {
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
    };
    const jwt = this.jwtService.sign(tokenPayload);
    return jwt;
  }
}
