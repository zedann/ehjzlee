import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateCheckoutDto, RESERVATIONS_MARK_RESERVATION_AS_PAID, RESERVATIONS_SERVICE } from '@app/common';
import { url } from 'inspector';
import { firstValueFrom, throwError } from 'rxjs';
import { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class StripeService {
  stripe: Stripe;

  constructor(private readonly configService: ConfigService , @Inject(RESERVATIONS_SERVICE) private readonly reservationsClient:ClientProxy) {
    this.stripe = new Stripe(
      this.configService.getOrThrow('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2025-07-30.basil',
      },
    );
  }

  async createCheckoutSession(createCheckoutSessionDto:CreateCheckoutDto){
    console.log("createCheckoutSessionDto::",createCheckoutSessionDto);
    const session = await this.stripe.checkout.sessions.create({
        mode:'payment',
        line_items:[
            {
              price_data:{
                currency:createCheckoutSessionDto.currency,
                product_data:{
                    name:createCheckoutSessionDto.productName,
                },
                unit_amount:createCheckoutSessionDto.unitAmount
              },
              quantity:createCheckoutSessionDto.quantity
            }
        ],
        success_url:this.configService.getOrThrow('CHECKOUT_SUCCESS_URL'),
        cancel_url:this.configService.getOrThrow('CHECKOUT_CANCEL_URL'),
        // If a Stripe customer id is provided, use it; otherwise fall back to email
        ...(createCheckoutSessionDto.customerId
          ? { customer: createCheckoutSessionDto.customerId }
          : {}),
        ...(createCheckoutSessionDto.customerEmail
          ? { customer_email: createCheckoutSessionDto.customerEmail }
          : {}),
        metadata:createCheckoutSessionDto.metadata
    })

    return {id:session.id , url:session.url}

  }

  async catchWebhook(req:Request){
    const sig = req.headers['stripe-signature']
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent((req as any).rawBody ?? req.body , sig as string , this.configService.getOrThrow('STRIPE_WEBHOOK_SECRET'));
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    let session: Stripe.Checkout.Session | undefined;
    let success: boolean | undefined;

    switch (event.type) {
      case 'payment_intent.succeeded': {
        session = event.data.object as unknown as Stripe.Checkout.Session;
        success = true;
        break;
      }
      case 'checkout.session.completed': {
        session = event.data.object as Stripe.Checkout.Session;
        success = session.payment_status === 'paid';
        break;
      }
      case 'checkout.session.async_payment_succeeded': {
        session = event.data.object as Stripe.Checkout.Session;
        success = true;
        break;
      }
      case 'checkout.session.async_payment_failed': {
        session = event.data.object as Stripe.Checkout.Session;
        success = false;
        break;
      }
      default:
        break;
    }

    if (session) {
      const reservationId = session.metadata?.reservationId;
      console.log('Stripe checkout session result', {
        sessionId: session.id,
        reservationId,
        eventType: event.type,
        paymentStatus: session.payment_status,
        success,
      });
    }

    return {
        sessionId: session?.id,
        reservationId: session?.metadata?.reservationId,
        eventType: event.type,
        paymentStatus: session?.payment_status,
        success,
    };
  }

  async markReservationAsPaid(reservationId:string){
    console.log("markReservationAsPaid::",reservationId);
    // Use request-response pattern and resolve the observable
    return firstValueFrom(
      this.reservationsClient.send(RESERVATIONS_MARK_RESERVATION_AS_PAID, reservationId),
    );
  }
}
