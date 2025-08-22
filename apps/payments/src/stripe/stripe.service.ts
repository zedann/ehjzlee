import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateCheckoutDto } from '@app/common';
import { url } from 'inspector';

@Injectable()
export class StripeService {
  stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.getOrThrow('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2025-07-30.basil',
      },
    );
  }

  async createCheckoutSession(createCheckoutSessionDto:CreateCheckoutDto){
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
        customer:createCheckoutSessionDto.customerId,
        metadata:createCheckoutSessionDto.metadata
    })

    return {id:session.id , url:session.url}

  }
}
