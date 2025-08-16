import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    await this.validateCreateUser(createUserDto);
    return this.usersRepository.create(createUserDto);
  }
  private async validateCreateUser(createUserDto: CreateUserDto) {
    try {
      await this.usersRepository.findOne({
        email: createUserDto.email,
      });
    } catch (_err) {
      return;
    }
    throw new UnprocessableEntityException();
  }
}
