import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/guards/auth.guard";
import { ChatService } from "./chat.service";
import { SendMessageDto } from "./dto/create-message.dto";
import { GetChatMessagesDto } from "./dto/get-chats.dto";
import { CreateGroupDto } from "./dto/create-group.dto";

@Controller('chat')
@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ChatController {
    constructor(private chatService: ChatService) { }
    @Post()
    sendMessage(@Body() body: SendMessageDto) {
        return this.chatService.sendMessgae(body)
    }

    @Get()
    getChats() {
        return this.chatService.getChats()
    }

    @Get(':chatId')
    getChatMessages(@Param('chatId') chatId: number, @Query() body: GetChatMessagesDto) {
        return this.chatService.getChatMessages(chatId, body)
    }


    @Post('/group')
    createGroup(@Body() body: CreateGroupDto) {
        return this.chatService.createGroup(body)
    }

    // @Get()
    // messageList(@Query('chatId') chatId: number, @Query('userId') userId: number) {
    //     return this.chatService.allMessage({ chatId, userId })
    // }
}