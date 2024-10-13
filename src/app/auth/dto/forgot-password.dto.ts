import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail } from "class-validator";

export class ForgetPasswordDto {
    @Type()
    @IsEmail()
    @ApiProperty({ default: 'john.doe@example.com' })
    email: string;
}