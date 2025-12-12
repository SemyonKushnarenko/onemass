import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PsychologistService } from './psychologist.service';
import { TelegramAuthGuard } from 'src/guards/telegram.guard';
import { AuthorizedRequest } from 'src/auth/auth.types';

@Controller('psychologist')
@UseGuards(TelegramAuthGuard)
export class PsychologistController {
  constructor(private readonly service: PsychologistService) {}

  @Get('patients')
  async listPatients(@Req() req: AuthorizedRequest) {
    const psych = await this.service.ensurePsychologist(req.user!);
    const patients = await this.service.listPatients(psych.id);
    return patients;
  }

  @Get('patient/:patientId')
  async patientDetail(
    @Req() req: AuthorizedRequest,
    @Param('patientId') patientId: string,
  ) {
    const psych = await this.service.ensurePsychologist(req.user!);
    const link = await this.service.getPatientLink(psych.id, patientId);
    if (!link) {
      return { moods: [] };
    }
    const patient = link.patient;
    return { patient, moods: patient?.moods ?? [] };
  }

  @Post('referral/create')
  async createReferral(@Req() req: AuthorizedRequest) {
    const psych = await this.service.ensurePsychologist(req.user!);
    const { referral, invoiceUrl, payload } =
      await this.service.createReferral(psych);
    return { referral, invoiceUrl, payload };
  }
}

