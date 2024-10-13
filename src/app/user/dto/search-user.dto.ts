import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString, Length, Max, Min, MinLength } from "class-validator";

export class SearchUserDto {
    @Type()
    @IsString()
    @ApiProperty()
    @MinLength(3)
    searchParam: string;

    @Type()
    @IsNumber()
    @ApiProperty({ required: false })
    @Min(0)
    @Max(100)
    limit: number;


    @Type()
    @IsNumber()
    @ApiProperty({ required: false })
    @Min(0)
    page: number
}