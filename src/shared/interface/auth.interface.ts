import { Request } from "express";
import { UserEntity } from "src/database/entities/User.entity";

export interface AuthRequest extends Request{
    user: UserEntity;
}