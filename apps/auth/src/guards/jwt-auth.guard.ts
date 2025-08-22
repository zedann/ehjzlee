import { RpcAuthRequest, UserDto } from '@app/common';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // For TCP microservice requests, the JWT is sent in the RPC data payload
    const request: RpcAuthRequest =
      (context.switchToRpc().getData() as RpcAuthRequest) ??
      (context.switchToHttp().getRequest() as RpcAuthRequest);
    console.log('requestrpc!!!', request);
    try {
      const decoded: TokenPayload = this.jwtService.verify(
        request.Authentication,
      );
      if (!decoded?.userId) {
        throw new UnauthorizedException('Invalid token');
      }
      return this.usersService
        .getUser({ _id: decoded.userId })
        .then((user) => {
          if (!user) {
            throw new UnauthorizedException('User not found');
          }
          // Attach the user to the RPC payload so the handler can return it
          (request as unknown as { user: UserDto }).user = {
            _id: (user as any)._id?.toString?.() ?? (user as any)._id,
            email: (user as any).email,
          } as UserDto;
          return true;
        });
    } catch (err: any) {
      throw new UnauthorizedException(err?.message ?? 'Unauthorized');
    }
  }
}
