import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';


@Module({
  controllers: [AdminController],
  providers: [ AdminService],
  imports: [PrismaModule, CloudinaryModule]
})
export class AdminModule {}
