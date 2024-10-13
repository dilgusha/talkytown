import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsString,
  Length,
  MaxDate,
} from 'class-validator';
import * as dateFns from 'date-fns';
import { Gender, UserRoles } from 'src/shared/enum/user.enum';

export class CreateUserDto {
  @Type()
  @IsString()
  @Length(3, 30)
  @ApiProperty()
  firstName: string;

  @Type()
  @IsString()
  @Length(3, 30)
  @ApiProperty()
  lastName: string;

  @Type()
  @IsString()
  @Length(3, 30)
  @ApiProperty()
  userName: string;

  @Type()
  @IsEmail()
  @ApiProperty()
  email: string;

  @Type()
  @IsString()
  @Length(3, 150)
  @ApiProperty()
  password: string;

  @Type()
  @IsDate()
  @MaxDate(() => dateFns.add(new Date(), { years: -10 }), {
    message: 'You are too young',
  })
  @ApiProperty()
  birthDate: Date;

  @Type()
  @IsEnum(Gender)
  @ApiProperty({ enum: Gender })
  gender: Gender;

  @Type()
  @IsEnum(UserRoles, { each: true })
  @ApiProperty({ default: [UserRoles.USER] })
  roles: UserRoles[];
}