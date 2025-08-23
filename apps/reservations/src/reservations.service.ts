import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateReservationDto,
  PAYMENT_STATUS,
} from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';
import { CreateCheckoutDto, PAYMENTS_CONFIRM_PAYMENT, PAYMENTS_CREATE_CHECKOUT_SESSION, PAYMENTS_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    @Inject(PAYMENTS_SERVICE) private readonly paymentsClient: ClientProxy,
  ) {}
  async create(createReservationDto: CreateReservationDto, userId: string, userEmail: string) {
    
    const reservation = await this.reservationsRepository.create({
      ...createReservationDto,
      timestamp: new Date(),
      userId,
      paymentStatus: PAYMENT_STATUS.ONGOING,
    });
    const checkoutSession = await this.paymentsClient.send(PAYMENTS_CREATE_CHECKOUT_SESSION, {
      productName: 'Reservation',
      currency: 'usd',
      unitAmount: 20 * 100,
      quantity: createReservationDto.amount,
      customerEmail: userEmail,
      metadata: {
        reservationId: reservation._id.toHexString(),
      },
    })
    return checkoutSession;
  }

  async findAll() {
    return this.reservationsRepository.find({});
  }

  async findOne(id: string) {
    return this.reservationsRepository.findOne({ _id: id });
  }

  async update(id: string, updateReservationDto: UpdateReservationDto) {
    return this.reservationsRepository.findOneAndUpdate(
      { _id: id },
      {
        $set: updateReservationDto,
      },
    );
  }

  async remove(id: string) {
    return this.reservationsRepository.findOneAndDelete({ _id: id });
  }

  async markReservationAsPaid(reservationId:string){
    console.log("update reservationId::",reservationId);
    return this.reservationsRepository.findOneAndUpdate({_id:reservationId},{$set:{paymentStatus:PAYMENT_STATUS.PAID}})
  }

  async checkReservationPaymentStatus(reservationId:string){
    const reservation = await this.reservationsRepository.findOne({_id:reservationId});
   if(!reservation){
    throw new NotFoundException('Reservation not found');
   }
   return reservation.paymentStatus;
  }
}
