import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, Max, Min } from "class-validator";

export class GetChatMessagesDto {
    @Type()
    @IsNumber()
    @ApiProperty()
    chatId:number


    @Type()
    @IsNumber()
    @ApiProperty({ default: 0 })
    @Min(0)
    @Max(100)
    limit: number;


    @Type()
    @IsNumber()
    @ApiProperty({ default: 10 })
    @Min(0)
    page: number
}