import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { AUTH_AUTHENTICATE, AUTH_SERVICE } from '../constants';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authorizationHeader = request?.headers?.authorization;
    console.log('request!!!', request.headers);

    const token = authorizationHeader?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    return this.authClient
      .send(AUTH_AUTHENTICATE, {
        Authentication: token,
      })
      .pipe(
        tap((res) => {
          console.log('res!!', res);
          request.user = res;
        }),
        map(() => true),
        catchError((err) => {
          // Map any RPC error (e.g., TokenExpiredError) to 401 Unauthorized for HTTP
          return throwError(() => new UnauthorizedException(err?.message));
        }),
      );
  }
}
