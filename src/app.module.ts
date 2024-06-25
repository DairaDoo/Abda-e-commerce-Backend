import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ProductsModule } from './products/products.module';
import { AdminModule } from './admin/admin.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FilterModule } from './filter/filter.module';
import { SearchModule } from './search/search.module';
import { CartService } from './cart/cart.service';
import { CartModule } from './cart/cart.module';
import { UserService } from './user/user.service';
import { OrderModule } from './order/order.module';
import { MailService } from './mail/mail.service';



@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, 
  }),
  UserModule, ProductsModule, AdminModule, CloudinaryModule, PrismaModule, FilterModule, SearchModule, CartModule, OrderModule],
  providers: [CartService, UserService, MailService],
})
export class AppModule {}
