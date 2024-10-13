import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatEntity } from "src/database/entities/Chat.entity";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { MessageEntity } from "src/database/entities/Message.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ChatEntity,MessageEntity])],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService]
})
export class ChatModule { }