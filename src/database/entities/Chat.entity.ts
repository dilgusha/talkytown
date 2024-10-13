import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { UserEntity } from "./User.entity";
import { MessageEntity } from "./Message.entity";
import { CommonEntity } from "./Common.entity";
import { ChatParticipantEntity } from "./ChatParticipant.entity";

@Entity()
export class ChatEntity extends CommonEntity {
    @Column()
    isGroup: boolean;

    @Column({ nullable: true })
    name: string;

    @OneToMany(() => MessageEntity, (message) => message.chat)
    messages: MessageEntity[];

    @OneToOne(() => MessageEntity, { nullable: true })
    @JoinColumn({ name: 'lastMessageId' })
    lastMessage: MessageEntity

    @OneToMany(() => ChatParticipantEntity, (chatParticipant) => chatParticipant.chat, { cascade: true })
    participants: ChatParticipantEntity[]



}
