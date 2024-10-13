import { ConflictException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/database/entities/User.entity";
import { FindManyOptions, FindOptionsWhere, ILike, Not, Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { SearchUserDto } from "./dto/search-user.dto";
import { SEARCH_USER_SELECT, USER_PROFILE_SELECT } from "./user-select";
import { ClsService } from "nestjs-cls";
import { NotFoundError } from "rxjs";
import { FollowStatus } from "src/shared/enum/follow.enum";
import { FindParams } from "src/shared/types/find.params";
import { UpdateUserDto } from "./dto/update-user.dto";
import { FollowService } from "../follow/follow.service";

@Injectable()
export class UserService {
    constructor(@InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
        private cls: ClsService,
        @Inject(forwardRef(() => FollowService))
        private followService: FollowService
    ) { }

    find(params: FindParams<UserEntity>) {
        const { where, select, relations, limit, page } = params
        let payload: FindManyOptions<UserEntity> = { where, select, relations }
        if (limit > 0) { payload.take = limit, payload.skip = limit * page }
        return this.userRepo.find(payload)
    }

    findOne(params: Omit<FindParams<UserEntity>, 'limit' | 'page'>) {
        const { where, select, relations } = params
        return this.userRepo.findOne({ where, relations, select })
    }

    async userProfile(id: number) {
        const myUser = await this.cls.get<UserEntity>('user')
        const relations = ['followers', 'followers.followedUser']
        const user = await this.findOne({ where: { id }, relations, select: USER_PROFILE_SELECT })
        if (!user) throw new NotFoundException('User not found')
        const followStatus = user.followers.find(follow => follow.followedUser.id === myUser.id)?.status || FollowStatus.NOT_FOLLOWING
        const result = { ...user, followStatus, followers: undefined }
        return result
    }

    async create(params: CreateUserDto) {
        let checkUserName = await this.findOne({ where: { userName: params.userName } });
        if (checkUserName) throw new ConflictException("Username already exists")
        let checkUserEmail = await this.findOne({ where: { email: params.email } })
        if (checkUserEmail) throw new ConflictException("Email already exists")
        let user = this.userRepo.create(params)
        await user.save()
        return user
    }

    async search(params: SearchUserDto) {
        const { searchParam, limit = 10, page = 0 } = params;
        const myUser = await this.cls.get<UserEntity>('user')
        let where: FindOptionsWhere<UserEntity>[] = [
            {
                userName: ILike(`${searchParam}%`)
            },
            {
                email: searchParam
            },
            {
                firstName: ILike(`%${searchParam}%`)
            },
            {
                lastName: ILike(`%${searchParam}%`)
            },
        ]
        const relations = ['followers', 'followers.followedUser']

        let users = await this.find({ where, select: SEARCH_USER_SELECT, page, limit, relations })
        let mapedUsers = users.map(user => {
            let isFollowing = user.followers.find(follow => follow.followedUser.id === myUser.id) !== undefined
            return { ...user, isFollowing, followers: undefined }
        })
        return mapedUsers;
    }


    async updateProfile(params: Partial<UpdateUserDto>,) {
        let myUser = await this.cls.get<UserEntity>('user')
        let payload: Partial<UserEntity> = {}
        for (let key in params) {
            switch (key) {
                case 'isPrivate':
                    payload.isPrivate = params.isPrivate;
                    if (params.isPrivate == false) {
                        await this.followService.acceptAllRequests(myUser.id)
                        myUser.followerCount++;
                        await myUser.save()
                    }
                    break;
                case 'profilePictureId':
                    payload.profilePicture = {
                        id: params.profilePictureId,
                    };
                    break;
                case 'userName':
                    let checkUserName = await this.findOne({
                        where: { userName: params.userName, id: Not(myUser.id) },
                    });
                    if (checkUserName)
                        throw new ConflictException('This username is already exists');
                    payload.userName = params.userName;
                    break;
                default:
                    payload[key] = params[key];
                    break;
            }
        }
        await this.update(myUser.id, payload)
        return {
            status: true,
            message: 'Profile updated successfully'
        }
    }

    async update(id: number, params: Partial<UserEntity>) {
        return await this.userRepo.update({ id }, params);
    }
}