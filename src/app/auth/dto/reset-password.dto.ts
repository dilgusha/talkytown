import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsString, Length, MinLength } from "class-validator";

export class ResetPassword {
    @Type()
    @IsString()
    @ApiProperty()
    @MinLength(10)
    token: string;

    @Type()
    @IsEmail()
    @ApiProperty()
    email: string;

    @Type()
    @IsString()
    @ApiProperty()
    @Length(3, 50)
    password: string;

    @Type()
    @IsString()
    @ApiProperty()
    @Length(3, 50)
    repeatPassword: string
}