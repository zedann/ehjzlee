import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Request } from 'express';
import { map, Observable, tap } from 'rxjs';
import { AUTH_SERVICE } from '../constants';
import { ClientProxy } from '@nestjs/microservices';

export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authorizationHeader = request?.headers?.authorization;

    const token = authorizationHeader?.split(' ')[1];
    if (!token) return false;

    return this.authClient
      .send('auth.authenticate', {
        Authentication: token,
      })
      .pipe(
        tap((res) => {
          console.log('res!!', res);
          request.user = res;
        }),
        map(() => true),
      );
  }
}
