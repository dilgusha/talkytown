import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { UserService } from "src/app/user/user.service";
import { UserEntity } from "src/database/entities/User.entity";
import { FollowStatus } from "src/shared/enum/follow.enum";
import { FindOptionsSelect } from "typeorm";

@Injectable()
export class ProfileGuard implements CanActivate {
    constructor(
        private userService: UserService,
        private cls: ClsService
    ) { }

    async canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        let userId = Number(req.params.userId || req.query.userId);
        if (!userId) throw new NotFoundException('User not found')

        const myUser = await this.cls.get<UserEntity>('user')
        if (myUser.id === userId) return true
        const select: FindOptionsSelect<UserEntity> = {
            id: true,
            isPrivate: true,
            followers: { followedUser: { id: true }, id: true, status: true }
        }
        let user = await this.userService.findOne({
            where: [
                { id: userId, isPrivate: false },
                {
                    id: userId, followers: {
                        status: FollowStatus.FOLLOWING,
                        followedUser: { id: myUser.id }
                    }
                }
            ],
            select,
            relations: ['followers', 'followers.followedUser']
        })
        if (!user) return false

        return true;
    }
}