import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [PrismaModule, JwtModule.register({secret: 'tuClaveSecreta', signOptions: {expiresIn: '1h'}})],
  exports: [UserService, JwtModule] 
})
export class UserModule {}

