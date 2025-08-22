import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  currency: string; // ex 'usd'

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  unitAmount: number; // in cents

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  customerId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, string>;
}