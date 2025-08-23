import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PAYMENT_STATUS } from '../dto/create-reservation.dto';

@Schema({
  versionKey: false,
})
export class ReservationDocument extends AbstractDocument {
  @Prop()
  timestamp: Date;
  @Prop()
  startDate: Date;
  @Prop()
  endDate: Date;
  @Prop()
  userId: string;
  @Prop()
  placeId: string;
  @Prop()
  invoiceId: string;
  @Prop({
    type: String,
    enum: PAYMENT_STATUS,
    default: PAYMENT_STATUS.ONGOING,
  })
  paymentStatus: PAYMENT_STATUS.ONGOING;
}

export const ReservationSchema =
  SchemaFactory.createForClass(ReservationDocument);
