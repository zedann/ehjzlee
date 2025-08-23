import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum PAYMENT_STATUS {
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  ONGOING = 'ONGOING',
}
export class CreateReservationDto {
  @IsDate()
  @Type(() => Date)
  startDate: Date;
  @IsDate()
  @Type(() => Date)
  endDate: Date;
  @IsString()
  @IsNotEmpty()
  placeId: string;
  @IsString()
  @IsNotEmpty()
  invoiceId: string;
  @IsNumber()
  @IsNotEmpty()
  amount: number;
 
}
