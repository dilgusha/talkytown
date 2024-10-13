import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, Length, Max, Min } from "class-validator";

export class GetUserPostsDto {
    @Type()
    @IsOptional()
    @ApiProperty({ default: 0 })
    @IsNumber()
    @Min(0)
    page: number;

    @Type()
    @IsOptional()
    @ApiProperty({ default: 10 })
    @IsNumber()
    @Min(5)
    @Max(20)
    limit: number;
}