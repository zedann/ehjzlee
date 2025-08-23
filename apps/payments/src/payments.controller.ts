import { BadRequestException, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { PAYMENTS_CREATE_CHECKOUT_SESSION, RESERVATIONS_MARK_RESERVATION_AS_PAID, RESERVATIONS_SERVICE } from '@app/common';
import { CreateCheckoutDto } from '@app/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';

@Controller()
export class PaymentsController {
  private stripeWebhookSecret:string;
  constructor(private readonly paymentsService: PaymentsService , private readonly stripeService:StripeService , private readonly configService:ConfigService ) {
    this.stripeWebhookSecret=this.configService.getOrThrow('STRIPE_WEBHOOK_SECRET');
  }

  @MessagePattern(PAYMENTS_CREATE_CHECKOUT_SESSION)
  async createCheckout(@Payload() createCheckoutDto:CreateCheckoutDto){
    if(!createCheckoutDto.metadata?.reservationId){
      throw new BadRequestException('Reservation ID is required');
    }
    return this.stripeService.createCheckoutSession(createCheckoutDto);
  }


  // HTTP STRIPE WEBHOOK ENDPOINT

  @Post('/stripe/webhook')
  async webhook(@Req() req:Request , @Res() res:Response){
    const result = await this.stripeService.catchWebhook(req);
    console.log("in webhook" , result);
    if(result.success && result.reservationId){
      console.log("result.reservationId::",result.reservationId);
      await this.stripeService.markReservationAsPaid(result.reservationId!);
    }else {
      throw new BadRequestException('Payment failed');
    }

    return res.json({ received: true, result });
  }

  
}
