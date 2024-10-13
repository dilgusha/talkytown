import { Controller, Delete, FileTypeValidator, MaxFileSizeValidator, Param, ParseFilePipe, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "./upload.service";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

@Controller('upload')
@ApiTags('Upload')
@ApiBearerAuth()
export class UploadController {
    constructor(private uploadService: UploadService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        required: true,
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    uploadImage(
        @Req() req: Request,

        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10485760 }),
                    new FileTypeValidator({
                        fileType: /image\/(jpg|jpeg|png)$/i,
                    }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.uploadService.uploadImage(req, file);
    }

    @Delete(':id')
    deleteImage(@Param('id') id: number) {
        return this.uploadService.deleteImage(id);
    }
}