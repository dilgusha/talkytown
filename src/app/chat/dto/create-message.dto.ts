import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Length } from "class-validator";

export class SendMessageDto {
    @Type()
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    userId: number

    @Type()
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    chatId: number

    @Type()
    @IsString()
    @ApiProperty()
    @Length(3, 100)
    message: string
}