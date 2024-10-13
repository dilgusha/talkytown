import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateGroupDto {
    @Type()
    @IsNumber({}, { each: true })
    @ApiProperty()
    userIds: number[];

    @Type()
    @IsString()
    @Length(3,50)
    @ApiProperty()
    name: string;

}