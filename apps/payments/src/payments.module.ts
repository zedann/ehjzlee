import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeService } from './stripe/stripe.service';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RESERVATIONS_SERVICE } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        HTTP_PORT: Joi.number().required(),
        TCP_PORT: Joi.number().required(),
        HOST: Joi.string().required(),
        STRIPE_SECRET_KEY: Joi.string().required(),
        STRIPE_WEBHOOK_SECRET: Joi.string().required(),
        CHECKOUT_SUCCESS_URL: Joi.string().required(),
        CHECKOUT_CANCEL_URL: Joi.string().required(),
        RESERVATIONS_HOST: Joi.string().required(),
        RESERVATIONS_PORT: Joi.number().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: RESERVATIONS_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow('RESERVATIONS_HOST'),
            port: configService.getOrThrow('RESERVATIONS_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService , ConfigService],
})
export class PaymentsModule {}
