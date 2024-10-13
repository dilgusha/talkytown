import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from './config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './app/user/user.module';
import { UploadModule } from './app/upload/upload.module';
import { AuthModule } from './app/auth/auth.module';
import { ClsGuard, ClsModule } from 'nestjs-cls';
import { APP_GUARD } from '@nestjs/core';
import { FollowModule } from './app/follow/follow.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PostdModule } from './app/post/post.module';
import { ChatModule } from './app/chat/chat.module';
import { SocketModule } from './socket/socket.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from './shared/libs/redis/redis.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      serveRoot: '/uploads',
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    RedisModule.register({
      host: config.redis.host,
      port: config.redis.port,
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.database.host,
      port: +config.database.port,
      username: config.database.username,
      password: config.database.pass,
      database: config.database.dbName,
      entities: [`${__dirname}/**/*.entity.{ts,js}`],
      migrations: [`${__dirname}/**/migrations/*.js`],
      synchronize: true,
      logging: true,
      // logger: 'advanced-console',
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      guard: { mount: true },
    }),
    JwtModule.register({
      global: true,
      secret: config.jwtSecret,
      signOptions: { expiresIn: '10d' },
    }),
    MailerModule.forRoot({
      transport: {
        host: config.smtp.host,
        port: config.smtp.port,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.password
        }
      },
      defaults: {
        from: config.smtp.from,
      },
      template: {
        dir: join(__dirname + '/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    AuthModule,
    UserModule,
    UploadModule,
    FollowModule,
    PostdModule,
    ChatModule,
    SocketModule
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: ClsGuard,
  },],
})
export class AppModule { }
