import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FollowEntity } from "src/database/entities/Follow.entity";
import { FindOptionsWhere, Repository } from "typeorm";
import { CreateFollowDto } from "./dto/create-follow.dto";
import { UserEntity } from "src/database/entities/User.entity";
import { UserService } from "../user/user.service";
import { ClsService } from 'nestjs-cls';
import { FollowStatus } from "src/shared/enum/follow.enum";
import { FindParams } from "src/shared/types/find.params";
import { FOLLOW_REQUEST_LIST_SELECT } from "./follow.select";

@Injectable()
export class FollowService {
    constructor(
        @InjectRepository(FollowEntity)
        private followRepo: Repository<FollowEntity>,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        private cls: ClsService
    ) { }


    async repeatCode(userId: number, followedMyUser: boolean) {
        let myUser = await this.cls.get<Promise<UserEntity>>('user')
        let user = await this.userService.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        let whereOption;
        if (followedMyUser) {
            whereOption = {
                followerUser: { id: user.id },
                followedUser: { id: myUser.id },
            }
        }
        else {
            whereOption = {
                followedUser: { id: user.id },
                followerUser: { id: myUser.id },
            }
        }
        let follow = await this.findOne({
            where: whereOption
        });
        if (!follow) throw new NotFoundException('Follow request not found');
        return { myUser, user, follow };

    }


    async findOne(params: Omit<FindParams<FollowEntity>, 'limit' | 'page'>) {
        const { where, select, relations } = params
        return this.followRepo.findOne({ where, select, relations })
    }
    async find(params: FindParams<FollowEntity>) {
        const { where, select, relations } = params
        return await this.followRepo.find({ where, select, relations })

    }
    async create(params: CreateFollowDto) {
        let myUser = await this.cls.get<Promise<UserEntity>>('user')
        console.log('myUser:', myUser);
        if (!myUser) throw new NotFoundException('aslinda ben yogum')
        let user = await this.userService.findOne({ where: { id: params.userId } })
        if (!user) throw new NotFoundException('user tapilmadi')


        let checkExists = await this.findOne({
            where: {
                followerUser: { id: user.id },
                followedUser: { id: myUser.id },
            }
        });
        if (checkExists) throw new ConflictException('You are already following  this user')
        if (user.id === myUser.id) throw new BadRequestException('You are not allowed to follow yourself')
        let follow = this.followRepo.create({
            followerUser: { id: user.id },
            followedUser: { id: myUser.id },
            status: user.isPrivate ? FollowStatus.WAITING : FollowStatus.FOLLOWING,
        });
        if (!user.isPrivate) {
            user.followerCount++;
            myUser.followedCount++;
            await Promise.all([user.save(), myUser.save()])
        }
        await follow.save();
        return follow
    }

    async accept(userId: number) {
        const { myUser, user, follow } = await this.repeatCode(userId, false)
        // let myUser = await this.cls.get<UserEntity>('user')
        // let user = await this.userService.findOne({ where: { id: userId } })

        // let follow = await this.findOne({
        //     where: {
        //         followedUser: { id: user.id },
        //         followerUser: { id: myUser.id }
        //     }
        // })

        // if (!follow) throw new NotFoundException('Follow request not found')

        if (follow.status == FollowStatus.FOLLOWING) throw new BadRequestException('You have already accepted this request')
        follow.status = FollowStatus.FOLLOWING;

        myUser.followerCount++;
        user.followedCount++;

        await Promise.all([user.save(), myUser.save(), [follow.save()]])

        return {
            status: true,
            message: 'You have successfully accepted this request'
        }
    }

    async reject(userId: number) {
        const { myUser, user, follow } = await this.repeatCode(userId, false)

        // let myUser = this.cls.get<UserEntity>('user')
        // let user = await this.userService.findOne({ where: { id: userId } })
        // if (!user) throw new NotFoundException('User not found')

        // let follow = await this.findOne({
        //     where: {
        //         followedUser: { id: user.id },
        //         followerUser: { id: myUser.id }
        //     }
        // })

        // if (!follow) throw new NotFoundException('Follow request not found')

        if (follow.status != FollowStatus.WAITING) throw new BadRequestException()

        follow.remove()


        return {
            status: true,
            message: 'Your have rejected this request'
        }
    }


    async removeFollow(userId: number) {
        const { myUser, user, follow } = await this.repeatCode(userId, false)

        // let myUser = await this.cls.get<UserEntity>('user')
        // let user = await this.userService.findOne({ where: { id: userId } })

        // if (!user) throw new NotFoundException('User not found')

        // let follow = await this.findOne({
        //     where: {
        //         followedUser: { id: user.id },
        //         followerUser: { id: myUser.id }
        //     }
        // })
        // if (!follow) throw new NotFoundException('Follow request not found')
        if (follow.status == FollowStatus.FOLLOWING) {
            myUser.followerCount--;
            user.followedCount--;
            await Promise.all([myUser.save(), user.save()])
        }

        await follow.remove()

        return {
            status: true,
            message: 'You have successfully removed this follow request'
        }
    }

    async unFollow(userId: number) {
        const { myUser, user, follow } = await this.repeatCode(userId, true)

        // let myUser = await this.cls.get<UserEntity>('user')
        // let user = await this.userService.findOne({ where: { id: userId } })

        // if (!user) throw new NotFoundException('User not found')

        // let follow = await this.findOne({
        //     where: {
        //         followerUser: { id: user.id },
        //         followedUser: { id: myUser.id }
        //     }
        // })

        // if (!follow) throw new NotFoundException('Follow not found')

        if (follow.status == FollowStatus.FOLLOWING) {
            user.followerCount--;
            myUser.followedCount--;
            await Promise.all([myUser.save(), user.save()])
        }

        await follow.remove()
    }


    async followList() {
        let myUser = await this.cls.get<UserEntity>('user')
        if (!myUser) throw new NotFoundException('Follow not found')
        return this.find({
            where: {
                followerUser: { id: myUser.id },
                status: FollowStatus.WAITING
            },
            relations: ['followedUser'],
            select: FOLLOW_REQUEST_LIST_SELECT
        })
    }


    async acceptAllRequests(userId: number) {
        return await this.followRepo.update({
            followerUser: { id: userId },
            status: FollowStatus.WAITING
        }, { status: FollowStatus.FOLLOWING })
    }
}