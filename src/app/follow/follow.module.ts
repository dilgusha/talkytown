import { forwardRef, Module } from "@nestjs/common";
import { FollowController } from "./follow.controller";
import { FollowService } from "./follow.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FollowEntity } from "src/database/entities/Follow.entity";
import { UserModule } from "../user/user.module";

@Module({
    imports: [TypeOrmModule.forFeature([FollowEntity]),forwardRef(() => UserModule)],
    providers: [FollowService],
    controllers: [FollowController],
    exports: [FollowService,forwardRef(()=>UserModule)]
})

export class FollowModule { }