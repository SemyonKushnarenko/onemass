import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PsychologistService } from './psychologist.service';
import { TelegramAuthGuard } from 'src/guards/telegram.guard';
import { AuthorizedRequest } from 'src/auth/auth.types';
import { IsString } from 'class-validator';

class ActivateReferralDto {
  @IsString()
  refCode: string;
}

@Controller('referral')
@UseGuards(TelegramAuthGuard)
export class ReferralController {
  constructor(private readonly service: PsychologistService) {}

  @Post('activate')
  async activate(@Req() req: AuthorizedRequest, @Body() dto: ActivateReferralDto) {
    await this.service.activateReferral(dto.refCode, req.user!);
    return { ok: true };
  }
}

