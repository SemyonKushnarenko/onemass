import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { UserCreatedVia } from 'src/user/user.types';

class InitDto {
  initData: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('init')
  async init(@Body() dto: InitDto) {
    const map = this.authService.getQueryMap(dto.initData);
    const payload = this.authService.validator.validate(map);
    if (!payload) {
      return { ok: false };
    }

    const user = await this.userService.getOrCreateUser(payload);
    if (!user.createdVia) {
      user.createdVia = UserCreatedVia.OTHER;
    }

    return { ok: true, user };
  }
}

