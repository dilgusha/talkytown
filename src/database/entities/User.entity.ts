import { BeforeInsert, Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { CommonEntity } from "./Common.entity";
import { ImageEntity } from "./Image.entity";
import { Gender, UserRoles } from "src/shared/enum/user.enum";
import * as bcrypt from 'bcrypt';
import { FollowEntity } from "./Follow.entity";
import { PostEntity } from "./Post.entity";
import { MessageEntity } from "./Message.entity";
import {  ChatParticipantEntity } from "./ChatParticipant.entity";

@Entity()
export class UserEntity extends CommonEntity {
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    userName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    bio: string;

    @Column()
    birthDate: Date;

    @Column({
        type: 'enum',
        enum: Gender,
        default: Gender.male,
    })
    gender: Gender;

    @Column({
        type: 'enum',
        enum: UserRoles,
        array: true
    })
    roles: UserRoles[];


    @Column({ default: 0 })
    followerCount: number;


    @Column({ default: 0 })
    followedCount: number;

    @Column({ default: false })
    isPrivate: boolean;

    @OneToOne(() => (ImageEntity), { eager: true })
    @JoinColumn()
    profilePicture: Partial<ImageEntity>;

    @OneToMany(() => FollowEntity, (follow) => (follow.followedUser))
    followeds: FollowEntity[]

    @OneToMany(() => FollowEntity, (follow) => (follow.followerUser))
    followers: FollowEntity[]

    // @OneToMany(() => MessageEntity, (message) => message.sender)
    // messages: MessageEntity[]


    @OneToMany(() => PostEntity, (post) => post.user)
    post: PostEntity[]

    @BeforeInsert()
    beforeInsert() {
        this.password = bcrypt.hashSync(this.password, 10)
    }



    @OneToMany(() => ChatParticipantEntity, (chatParticipant) => chatParticipant.user)
    chatParticipants: ChatParticipantEntity[];

    
    get fullName() {
        return `${this.firstName} ${this.lastName}`
    }
}