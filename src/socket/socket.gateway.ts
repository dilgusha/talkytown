import { OnEvent } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { log } from "console";
import { Server, Socket } from "socket.io";
import { ChatService } from "src/app/chat/chat.service";
import { UserService } from "src/app/user/user.service";
import { ChatEntity } from "src/database/entities/Chat.entity";
import { MessageEntity } from "src/database/entities/Message.entity";

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})
export class SocketGateway {
    @WebSocketServer()
    server: Server
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private chatService: ChatService,
    ) { }

    @SubscribeMessage('auth')
    async handleAuth(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        const token = body?.token
        try {
            let payload = await this.jwtService.verify(token)
            if (!payload.userId) throw new Error('user not found')
            let user = await this.userService.findOne({ where: { id: payload.userId } })
            if (!user) throw new Error('user not found')

            client.data.userId = user
            client.emit('auth', { status: true, userId: user.id, message: 'user id successfully' })
        } catch (error) {
            client.emit('auth', { status: false, error: error?.message });
        }


    }
    @SubscribeMessage('chat')
    handleChat(@MessageBody() body: any) {
        console.log(body);

    }

    @SubscribeMessage('writing')
    async writingStatus(@MessageBody() body: { chatId: number, status: boolean }, @ConnectedSocket() client: Socket) {
        const { chatId = 0, status } = body || {}
        const user = client.data?.user
        const userId = user?.id
        if (!userId) return;
        let chat = await this.chatService.findById(chatId)

        if (!chat.participants.find(p => p.user.id === userId)) return;

        let participants = chat.participants.filter(p => p.user.id != userId)

        let sockets = await this.server.fetchSockets()

        for (let participant of participants) {
            let participantSocket = sockets.find(socket => socket.data?.user?.id === participant.user.id)
            if (!participantSocket) continue

            participantSocket.emit('chat-writing', { userId, username: user.userName, status })
        }

    }

    @OnEvent('message.created')
    async handleMessageCreated(payload: { chat: ChatEntity, message: MessageEntity }) {
        const { chat, message } = payload
        let receivers = chat.participants.filter(p => p.user.id !== message.sender.id)

        let socket = await this.server.sockets.fetchSockets()
        for (let receiver of receivers) {
            let receiverSocket = socket.find(socket => socket.data?.user?.id == receiver.user.id)
            if (receiverSocket) {
                receiverSocket.emit('message.created', message)
            }
        }
    }

    private async notifyClient(chat: ChatEntity, message: MessageEntity, event: string) {
        let participants = chat.participants.filter(p => p.user.id != message.sender.id);
        let sockets = await this.server.sockets.fetchSockets();

        for (let participant of participants) {
            let socket = sockets.find(socket => socket.data?.user?.id == participant.user.id);

            if (!socket) continue;
            socket.emit(event, chat);
        }
    }
    @OnEvent('chat.create')
    async handleCreateChat(payload: { chat: ChatEntity, message: MessageEntity }) {
        const { chat, message } = payload
        await this.notifyClient(chat, message, 'chat.create')
    }

    @OnEvent('chat.create')
    async handleUpdateChat(payload: { chat: ChatEntity, message: MessageEntity }) {
        const { chat, message } = payload
        await this.notifyClient(chat, message, 'chat.update')
    }

}