import { UserEntity } from "src/database/entities/User.entity";
import { FindOptionsSelect } from "typeorm";

export const SEARCH_USER_SELECT: FindOptionsSelect<UserEntity> = {
    id: true,
    firstName: true,
    lastName: true,
    userName: true,
    profilePicture: {
        url: true
    },
}
export const USER_PROFILE_SELECT: FindOptionsSelect<UserEntity> = {
    id: true,
    firstName: true,
    lastName: true,
    userName: true,
    bio: true,
    birthDate:true,
    followerCount: true,
    followedCount: true,
    isPrivate: true,
    profilePicture: { url: true },
    followers: {
        id: true,
        status: true,
        followedUser: {
            id: true,
        },
    }
}