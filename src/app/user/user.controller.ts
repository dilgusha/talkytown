import { Body, Controller, Get, NotFoundException, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/guards/auth.guard";
import { AuthRequest } from "src/shared/interface/auth.interface";
import { SearchUserDto } from "./dto/search-user.dto";
import { UserEntity } from "src/database/entities/User.entity";
import { ClsService } from "nestjs-cls";
import { UpdateUserDto } from "./dto/update-user.dto";
import { USER_PROFILE_SELECT } from "./user-select";

@Controller('user')
@ApiTags('User')
@ApiBearerAuth()
export class UserController {
    constructor(private userService: UserService,
        private cls: ClsService
    ) { }
    @Get('/profile')
    @UseGuards(AuthGuard)
    async myProfile() {
        let user =await this.cls.get<UserEntity>('user')
        return this.userService.findOne({ where: { id: user.id } ,select:USER_PROFILE_SELECT});
    }

    @Post('profile')
    @UseGuards(AuthGuard)
    async updateProfile(@Body() body:UpdateUserDto){
        return this.userService.updateProfile(body)

    }
    @Get('/profile:id')
    @UseGuards(AuthGuard)
    async userProfile(@Param('id') id: number) {
        let user = await this.userService.findOne({ where: { id } });
        if (!user) throw new NotFoundException();
        return user;

    }

    @Get('search')
    @UseGuards(AuthGuard)
    search(@Query() query: SearchUserDto) {
        this.userService.search(query)
    }
}