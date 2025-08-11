import { IsDate } from 'class-validator';

export class CreateReservationDto {
  startDate: Date;
  endDate: Date;
  placeId: string;
  invoiceId: string;
}
