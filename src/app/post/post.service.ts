import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostEntity } from "src/database/entities/Post.entity";
import { Repository } from "typeorm";
import { CreatePostDto } from "./dto/create-post.dto";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entities/User.entity";
import { FindOneParams, FindParams } from "src/shared/types/find.params";
import { GetUserPostsDto } from "./dto/user.posts.dto";
import { log } from "console";

@Injectable()
export class PostService {
    constructor(@InjectRepository(PostEntity)
    private postRepo: Repository<PostEntity>,
        private cls: ClsService
    ) { }


    async find(params: FindParams<PostEntity>) {
        const { where, select, relations, limit, page, order } = params
        return await this.postRepo.find({ where, select, relations, take: limit, skip: page * limit || 0, order })
    }

    async findOne(params: FindOneParams<PostEntity>) {
        const { where, select, relations } = params
        return await this.postRepo.findOne({ where, select, relations })
    }
    async userPosts(userId: number, params: GetUserPostsDto) {
        const { page = 0, limit = 10 } = params
        return this.find({
            where: {
                user: { id: userId }
            },
            order: {
                id: 'DESC'
            },
            page,
            limit
        })
    }

    async create(params: CreatePostDto) {
        let myUser = await this.cls.get<UserEntity>('user')

        let images = params.images.map((id) => ({ id }))
        let post = this.postRepo.create({ ...params, images, user: { id: myUser.id } })

        await post.save()
        return {
            status: true,
            post,
        }
    }


    async toggleLike(postId: number, userId: number) {
        let myUser = await this.cls.get<Promise<UserEntity>>('user')

        let post = await this.findOne({ where: { id: postId, user: { id: userId } } })

        if (!post) throw new NotFoundException('Post not found')

        const checkLiked = post.likes.includes(myUser.id)

        if (checkLiked) {
            post.likes = post.likes.filter((userId) => userId !== myUser.id)
        }
        else {
            post.likes.push(myUser.id)
        }
        await post.save()
        console.log(post.likes);

        return {
            status: true,
            message: checkLiked ? 'Successfully unliked the post' : 'Successfully liked the post',
            likeCount: post.likeCount
        }
    }
}