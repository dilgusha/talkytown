import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { CommonEntity } from "./Common.entity";
import { ImageEntity } from "./Image.entity";
import { UserEntity } from "./User.entity";

@Entity()
export class PostEntity extends CommonEntity {
    @ManyToMany(() => ImageEntity,{eager:true})
    @JoinTable({ name: 'post_images' })
    images: ImageEntity[];

    @Column()
    desc: string;

    @Column({ type: 'json', default: [] })
    likes: number[];

    @ManyToOne(() => UserEntity, user => user.post, { onDelete: 'CASCADE' })
    user: UserEntity

    get likeCount(){
        return this.likes.length
    }
}