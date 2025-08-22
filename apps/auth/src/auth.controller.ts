import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from '@app/common/decorators';
import { UserDocument } from './users/model/user.schema';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AUTH_AUTHENTICATE } from '@app/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@CurrentUser() user: UserDocument) {
    const accessToken = await this.authService.login(user);
    return {
      user,
      accessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern(AUTH_AUTHENTICATE)
  async authenticate(@Payload() data: any) {
    return data.user;
  }
}
