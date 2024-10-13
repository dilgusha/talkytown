import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { TypeOrmModule } from "@nestjs/typeorm";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { ImageEntity } from "src/database/entities/Image.entity";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";

@Module({
    imports: [TypeOrmModule.forFeature([ImageEntity]),
    MulterModule.register({
        storage: diskStorage({
            destination: join(__dirname, '../../../uploads'),
            filename: function (req, file, cb) {
                cb(null, `${Date.now()} ${extname(file.originalname.toLowerCase())}`);
            }
        })
    },
    ),],
    controllers: [UploadController],
    providers: [UploadService],
    exports: [UploadService]
})
export class UploadModule { }