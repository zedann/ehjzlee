import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PAYMENTS_CREATE_CHECKOUT_SESSION } from '@app/common';
import { CreateCheckoutDto } from '@app/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';

@Controller()
export class PaymentsController {
  private stripeWebhookSecret:string;
  constructor(private readonly paymentsService: PaymentsService , private readonly stripeService:StripeService , private readonly configService:ConfigService) {
    this.stripeWebhookSecret=this.configService.getOrThrow('STRIPE_WEBHOOK_SECRET');
  }

  @MessagePattern(PAYMENTS_CREATE_CHECKOUT_SESSION)
  async createCheckout(@Payload() createCheckoutDto:CreateCheckoutDto){
    return this.stripeService.createCheckoutSession(createCheckoutDto);
  }


  // HTTP STRIPE WEBHOOK ENDPOINT

  @Post('/stripe/webhook')
  async webhook(@Req() req:Request , @Res() res:Response){
    const sig = req.headers['stripe-signature']
    let event: Stripe.Event;

    try {
      const stripe = (this.stripeService).stripe;
      event = stripe.webhooks.constructEvent((req as any).rawBody ?? req.body , sig as string , this.stripeWebhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

        // Handle events you care about
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object as Stripe.Checkout.Session;
          // TODO: mark reservation as paid, publish domain event, etc.
          console.log('Checkout complete for session:', session.id, session.metadata);
        }
    
        res.json({ received: true });
    
  }

  
}
