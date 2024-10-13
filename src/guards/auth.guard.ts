import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { ClsService } from "nestjs-cls";
import { UserService } from "src/app/user/user.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private reflector: Reflector,
        private cls: ClsService
    ) { }

    async canActivate(context: ExecutionContext,): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        let token = req.headers.authorization || '';

        token = token.split(' ')[1];
        if (!token) throw new UnauthorizedException();

        try {
            let payload = await this.jwtService.verify(token)
            if (!payload.userId) throw new Error();

            let user = await this.userService.findOne({ where: { id: payload.userId } })

            if (!user) throw new Error()
            this.cls.set('user', user)
            // req.user = user
        } catch (error) {
            throw new UnauthorizedException()
        }

        return true;
    }
}