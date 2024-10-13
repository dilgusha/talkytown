import { ApiProperty } from "@nestjs/swagger";

export class UploadImageDto {
    @ApiProperty({
        format: 'binary',
        name: 'file'
    })
    file: Express.Multer.File
}