import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { TelegramAuthGuard } from '../guards/telegram.guard';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => UserModule)],
  controllers: [AuthController],
  providers: [AuthService, TelegramAuthGuard],
  exports: [AuthService, TelegramAuthGuard],
})
export class AuthModule {}
