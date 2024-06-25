import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GeneralProductDTO } from 'src/dto/products_dto';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
  imports: [PrismaModule, GeneralProductDTO]
})
export class SearchModule {}
