import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './database/entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  
  getHello(): string {
    return 'Hello World!';
  }
}
