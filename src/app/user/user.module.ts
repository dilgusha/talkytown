import { forwardRef, Global, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/database/entities/User.entity";
import { FollowModule } from "../follow/follow.module";
import { FollowEntity } from "src/database/entities/Follow.entity";

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]),forwardRef(()=>FollowModule)],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule { }