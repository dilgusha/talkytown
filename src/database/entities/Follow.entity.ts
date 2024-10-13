import { Column, Entity, ManyToOne } from "typeorm";
import { UserEntity } from "./User.entity";
import { CommonEntity } from "./Common.entity";
import { FollowStatus } from "src/shared/enum/follow.enum";

@Entity()
export class FollowEntity extends CommonEntity {
    @Column({ default: FollowStatus.WAITING })
    status: FollowStatus;

    @ManyToOne(() => UserEntity, (user) => (user.followers), { onDelete: 'CASCADE' })
    followerUser: UserEntity;


    @ManyToOne(() => UserEntity, (user) => (user.followeds), { onDelete: 'CASCADE' })
    followedUser: UserEntity;
}