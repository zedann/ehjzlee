import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { raw } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsModule, {
    cors: true,
  });

  const configService = app.get(ConfigService);

  app.use('/stripe/webhook', raw({ type: 'application/json' }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: configService.getOrThrow('HOST'),
      port: configService.getOrThrow('TCP_PORT'),
    },
  });
  await app.startAllMicroservices(); // TCP
  await app.listen(configService.getOrThrow('HTTP_PORT')); // HTTP
}
bootstrap();
