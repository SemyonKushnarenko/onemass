import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MoodService } from './mood.service';
import { TelegramAuthGuard } from 'src/guards/telegram.guard';
import { AuthorizedRequest } from 'src/auth/auth.types';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

class SubmitMoodDto {
  @Min(1)
  @Max(5)
  @IsInt()
  value: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

@Controller('mood')
@UseGuards(TelegramAuthGuard)
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post('submit')
  async submit(@Req() req: AuthorizedRequest, @Body() dto: SubmitMoodDto) {
    const mood = await this.moodService.submitMood({
      user: req.user!,
      value: dto.value,
      comment: dto.comment,
    });
    return mood;
  }

  @Get('list')
  async list(
    @Req() req: AuthorizedRequest,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const moods = await this.moodService.listByUser({
      user: req.user!,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
    return moods;
  }

  @Get('stats')
  async stats(@Req() req: AuthorizedRequest) {
    return this.moodService.stats({ user: req.user! });
  }
}
