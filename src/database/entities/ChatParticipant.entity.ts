import { Column, Entity, ManyToMany, ManyToOne } from "typeorm";
import { CommonEntity } from "./Common.entity";
import { UserEntity } from "./User.entity";
import { ChatEntity } from "./Chat.entity";

@Entity()
export class ChatParticipantEntity extends CommonEntity {

    @ManyToOne(() => UserEntity, (user) => user.chatParticipants)
    user: UserEntity


    @ManyToOne(() => ChatEntity, (chat) => chat.participants, { onDelete: 'CASCADE' })
    chat: ChatEntity;

    @Column({ default: 0 })
    unreadCount: number
}