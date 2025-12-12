import type { CanActivate, ExecutionContext } from '@nestjs/common';
import {
  Injectable,
  Logger,
  Inject,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from '../user/user.service';
import type { User } from '../user/user.entity';
import { AuthService } from '../auth/auth.service';
import type { TelegramUserData, AuthorizedRequest } from '../auth/auth.types';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(
    @Inject() private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType();
    let token: string | null = null;
    let requestUrl = '';

    if (type === 'http') {
      const request = context.switchToHttp().getRequest<AuthorizedRequest>();
      token = this.extractTokenFromHttp(request);
      requestUrl = request.url;
    }

    if (!token) {
      Logger.warn(`[TelegramAuthGuard] No token provided for ${requestUrl}`);
      throw new UnauthorizedException('No token provided');
    }

    return this.validateToken(token, requestUrl, context);
  }

  private extractTokenFromHttp(request: Request): string | null {
    return request.headers['authorization'] ?? null;
  }

  async validateToken(
    token: string,
    requestUrl: string,
    context: ExecutionContext,
  ): Promise<boolean> {
    try {
      const queryMap = this.authService.getQueryMap(token);
      const payload = await this.validatePayload(queryMap, requestUrl);
      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      try {
        const user = await this.userService.getOrCreateUser(payload);

        this.injectUserInContext(context, user);

        return true;
      } catch (err) {
        Logger.error(
          `[TelegramAuthGuard][validateToken] Failed to get or create user: ${err.message}`,
          err,
          err.stack,
        );
        throw err;
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      Logger.error(
        `[TelegramAuthGuard][validateToken] Failed to validate token: ${err.message}`,
        err,
        err.stack,
      );
      throw new InternalServerErrorException(
        'Unknown error occurred while validating token',
      );
    }
  }

  private async validatePayload(
    queryMap: any,
    requestUrl: string,
  ): Promise<TelegramUserData> {
    try {
      const authResult = this.authService.validator.validate(queryMap);
      if (authResult === null) {
        throw new UnauthorizedException('Invalid auth request');
      }
      return authResult;
    } catch (err) {
      throw err;
    }
  }

  private injectUserInContext(context: ExecutionContext, user: User): void {
    const type = context.getType();

    if (type === 'http') {
      const request = context.switchToHttp().getRequest<AuthorizedRequest>();
      request.user = user;
    }
  }
}
