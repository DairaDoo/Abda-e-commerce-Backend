import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [CartController],
  providers: [CartService, UserService, PrismaService],
  imports: [PrismaModule, UserModule, JwtModule.register({secret: 'tuClaveSecreta', signOptions: {expiresIn: '1h'}})]
})
export class CartModule {}
