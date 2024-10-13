import { BadRequestException, HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatEntity } from "src/database/entities/Chat.entity";
import { MessageEntity } from "src/database/entities/Message.entity";
import { In, Repository } from "typeorm";
import { SendMessageDto } from "./dto/create-message.dto";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entities/User.entity";
import { CHAT_LIST_SELECT, CHAT_MESSAGES_SELECT } from "./chat.select";
import { GetChatMessagesDto } from "./dto/get-chats.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { RedisService } from "src/shared/libs/redis/redis.service";
import { CreateGroupDto } from "./dto/create-group.dto";

@Injectable()
export class ChatService {
    constructor(
        private cls: ClsService,
        @InjectRepository(ChatEntity)
        private chatRepo: Repository<ChatEntity>,
        @InjectRepository(MessageEntity)
        private messageRepo: Repository<MessageEntity>,
        private eventEmitter: EventEmitter2,
        private redisService: RedisService

    ) { }


    async findById(id: number) {
        let myUser = await this.cls.get<UserEntity>('user')
        return this.chatRepo.findOne({ where: { id }, relations: ['participants', 'participants.user'] })

    }
    async findOrCreteChat(params: { chatId?: number, userId?: number }) {
        let { chatId, userId } = params
        let isNew = false
        let myUser = await this.cls.get<UserEntity>('user')
        if (myUser.id === userId) throw new BadRequestException('you cant send messages to yourself')
        let chat: ChatEntity
        if (userId) {
            chat = await this.chatRepo.createQueryBuilder('chat')
                .leftJoinAndSelect('chat.participants', 'participants')
                .leftJoinAndSelect('participants.user', 'users')
                .innerJoin('chat.participants', 'p1', 'p1.userId = :myUserId', { myUserId: myUser.id })
                .innerJoin('chat.participants', 'p2', 'p2.userId= :userId', { userId })
                .getOne()

            if (!chat) {
                chat = this.chatRepo.create({
                    isGroup: false,
                    participants: [
                        {
                            user: { id: myUser.id }
                        },
                        {
                            user: {
                                id: userId
                            }
                        }
                    ]
                })
                await chat.save()
                isNew = true
            }
            // this is repository api type
            // chat = await this.chatRepo.findOne({
            //     where: {
            //         users: {
            //             id: In([myUser.id, userId])
            //         },

            //     }
            //     , relations: ['users']
            // })
        }
        else if (chatId) {
            chat = await this.chatRepo.findOne({ where: { id: chatId }, relations: ['participants', 'participants.user'] })
            if (!chat || !chat.participants.find(participant => participant.user.id === myUser.id)) {
                throw new NotFoundException('Chat not found or you are not logged in this chat')
            }
        } else return {}
        return { chat, isNew }
    }
    async sendMessgae(params: SendMessageDto) {
        const { userId, chatId } = params;
        let myUser = await this.cls.get<UserEntity>('user')
        let { chat, isNew } = await this.findOrCreteChat({ userId, chatId })
        if (!chat) throw new NotFoundException('Chat not found or you are not logged in')

        let message = this.messageRepo.create({
            chat: {
                id: chat.id
            },
            message: params.message,
            sender: {
                id: myUser.id
            },
            readBy: [myUser.id]
        })
        await message.save()

        chat.lastMessage = { id: message.id } as MessageEntity


        chat.participants.map(participant => {
            if (participant.user.id === myUser.id) {
                return participant
            }
            else {
                participant.unreadCount++
            }
        })
        await chat.save()


        if (isNew) {
            this.eventEmitter.emit('chat.create', chat)
        } else {
            this.eventEmitter.emit('chat.update', chat)
        }
        this.eventEmitter.emit('message.created', { chat, message })

        // let message = this.messageRepo.create({
        //     chat: chat,
        //     messages: params.message,
        //     readBy: [myUser.id]
        // })
        // await this.messageRepo.save(message)

        await Promise.all(chat.participants.map((p) => this.redisService.delete(`chatlist${p.user.id}`)))
        return {
            status: true,
            message: 'Message sent successfully'
        }
    }

    async getChats() {
        const myUser = await this.cls.get<UserEntity>('user')
        // let cacheData = await this.redisService.get(`chatlist${myUser.id}`)
        // if (cacheData) {
        //     console.log('DATA FROM CACHE');
        //     return JSON.parse(cacheData);
        // }

        let chats = await this.chatRepo
            .createQueryBuilder('chat')
            .select(CHAT_LIST_SELECT)
            .leftJoin('chat.lastMessage', 'lastMessage')
            .leftJoin('lastMessage.sender', 'sender')
            .leftJoin('sender.profilePicture', 'senderProfilePicture')
            .leftJoin('chat.participants', 'participants')
            .leftJoin('participants.user', 'users')
            .leftJoin('chat.participants', 'myParticipant')
            .where(`myParticipant.userId = :userId`, { userId: myUser.id })
            .getMany();

        // .createQueryBuilder('chat')
        // .select(CHAT_LIST_SELECT)
        // .leftJoin('chat.lastMessage', 'lastMessage')
        // .leftJoin('lastMessage.sender', 'sender')
        // .leftJoin('sender.profilePicture', 'senderProfilePicture')
        // .leftJoin('chat.participants', 'participants')
        // .leftJoin('participants.user', 'users')
        // .leftJoin('chat.participants', 'myParticipant')
        // .where(`myParticipant.userId = :userId`, { userId: myUser.id })
        // .getMany();

        // if (!chats.some(chat => chat.lastMessage)) {
        //     throw new NotFoundException('No last message found')
        // }

        let result = chats.map((chat) => {
            let myParticipant = chat.participants.find(p => p.user.id === myUser.id)
            return {
                ...chat,
                unreadCount: myParticipant.unreadCount,
                everyoneRead: !chat.participants.find(p => p.unreadCount > 0),
                participants: undefined
            }
        })
        this.redisService.set(`chatlist${myUser.id}`, JSON.stringify(result))
        return result
    }

    async getChatMessages(chatId: number, params: GetChatMessagesDto) {
        const { page = 0, limit = 10 } = params
        let myUser = await this.cls.get<UserEntity>('user')
        let chat = await this.chatRepo.createQueryBuilder('chat')
            .leftJoinAndSelect('chat.participants', 'participants')
            .leftJoinAndSelect('participants.user', 'users')
            .where('chat.id =:chatId', { chatId })
            .getOne();
        if (!chat || !chat.participants.find((p) => p.user.id === myUser.id)) throw new NotFoundException('chat not found')

        let messages = await this.messageRepo.find({
            where: {
                chat: {
                    id: chat.id
                }
            },
            select: CHAT_MESSAGES_SELECT,
            order: {
                createdAt: 'DESC'
            },
            take: limit,
            skip: page * limit,
            relations: ['sender']
        })

        let myParticipant = chat.participants.find(p => p.user.id === myUser.id)
        myParticipant.unreadCount = 0


        messages.forEach(message => {
            if (!message.readBy.includes(myUser.id)) {
                message.readBy.push(myUser.id)
            }
        })

        await Promise.all([myParticipant.save(), this.messageRepo.save(messages)])
        return messages
    }


    async createGroup(body: CreateGroupDto) {
        const { userIds, name } = body
        const myUser = await this.cls.get<UserEntity>('user')
        let chat = this.chatRepo.create({
            isGroup: true,
            name,
            participants: [...userIds, myUser.id].map(id => ({
                user: {
                    id
                }
            }))
        })
        await chat.save()
        return chat
    }

    // async allMessage(params: { chatId?: number, userId?: number }) {
    //     let { chatId, userId } = params
    //     let myUser = await this.cls.get<UserEntity>('user')
    //     if (!userId) throw new NotFoundException()
    //     if (!myUser) throw new NotFoundException('Follow not found')

    //     let chat = await this.findOrCreteChat({ chatId, userId })
    //     if (!chat) throw new NotFoundException('Follow not found')

    //     return this.messageRepo.createQueryBuilder('messages')
    //         .leftJoinAndSelect('messages.chat', 'chat')
    //         .leftJoinAndSelect('messages.sender', 'sender')
    //         .where(`chat.id=:chatId`, { chatId })
    //         .select([
    //             'messages.messages',
    //             'sender.id',
    //             'sender.userName',
    //             'chat.id'
    //         ])
    //         .orderBy('messages.createdAt', 'ASC')
    //         .getMany()

    //     // console.log(messages);


    //     // return this.messageRepo.find({
    //     //     where: {
    //     //         chat: {
    //     //             id: chatId,
    //     //         },
    //     //     },
    //     //     relations: ['chat'],
    //     //     order: {
    //     //         createdAt: 'ASC'
    //     //     }
    //     // })

    // }
}