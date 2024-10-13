import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';

import { CreateUserDto } from './create-user.dto';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Length } from 'class-validator';
export class UpdateUserDto extends PickType(PartialType(CreateUserDto), ['firstName', 'lastName', 'userName', 'birthDate']) {
    @Type()
    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    profilePictureId: number;

    @Type()
    @IsBoolean()
    @IsOptional()
    @ApiProperty()
    @Length(0, 100)
    bio: string

    @Type()
    @IsBoolean()
    @IsOptional()
    @ApiProperty({ required: false, default: false })
    isPrivate: boolean
}