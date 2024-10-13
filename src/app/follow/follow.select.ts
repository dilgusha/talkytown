import { FollowEntity } from "src/database/entities/Follow.entity";
import { FindOptionsSelect } from "typeorm";
import { SEARCH_USER_SELECT } from "../user/user-select";

export const FOLLOW_REQUEST_LIST_SELECT: FindOptionsSelect<FollowEntity> = {
    followedUser: SEARCH_USER_SELECT
}