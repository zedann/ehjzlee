import { Controller, Get, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  async createUser(createUserDto: CreateUserDto) {}
  @Get()
  async getUser() {
    return 'user';
  }
}
