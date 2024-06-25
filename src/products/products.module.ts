import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GeneralProductDTO } from 'src/dto/products_dto';

@Module({
    controllers: [ProductsController],
    providers: [ProductsService],
    imports: [PrismaModule, GeneralProductDTO]
})
export class ProductsModule {}