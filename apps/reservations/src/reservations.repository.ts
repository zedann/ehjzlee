import { AbstractRepository } from '@app/common/database/abstract.repository';
import { ReservationDocument } from './model/reservation.schema';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class ReservationsRepository extends AbstractRepository<ReservationDocument> {
  protected logger: Logger = new Logger(ReservationsRepository.name);
  constructor(
    @InjectModel(ReservationDocument.name)
    reservationModel: Model<ReservationDocument>,
  ) {
    super(reservationModel);
  }
}
