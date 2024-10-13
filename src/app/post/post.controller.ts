import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/guards/auth.guard";
import { PostService } from "./post.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entities/User.entity";
import { GetUserPostsDto } from "./dto/user.posts.dto";
import { ProfileGuard } from "src/guards/profile.guards";

@Controller('post')
@ApiTags('User posts')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class PostController {
    constructor(
        private cls: ClsService,
        private postService: PostService
    ) { }

    @Get('user')
    async myPosts(@Query() query: GetUserPostsDto) {
        const myUser = await this.cls.get<Promise<UserEntity>>('user')
        return this.postService.userPosts(myUser.id, query)
    }

    @Get('user/:userId')
    @UseGuards(ProfileGuard)
    userPosts(@Param('userId') userId: number, @Query() query: GetUserPostsDto) {
        return this.postService.userPosts(userId, query)
    }

    @Post()
    createPost(@Body() body: CreatePostDto) {
        return this.postService.create(body)
    }
    @Post('user/:userId/like/:postId')
    @UseGuards(ProfileGuard)
    toggleLike(@Param('postId') postId: number, @Param('userId') userId: number) {
        return this.postService.toggleLike(postId, userId)
    }
}