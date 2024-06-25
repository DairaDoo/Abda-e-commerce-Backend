import { Injectable, Controller, Post, UseInterceptors, Body, UploadedFiles, Put, Delete, } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { ProductReceived } from "src/dto/product_recived";
import { EditProductReceived } from "src/dto/product_edit_recived";
import { AdminService } from "./admin.service";
import { Product } from "src/dto/products_dto";
import { DeleteProductId } from "src/dto/product_edit_recived";

@Controller('api/admin')
@Injectable()
export class AdminController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly adminService: AdminService
    ) {}

    @Post('/product/create')
    @UseInterceptors(AnyFilesInterceptor())
    async createProduct(
        @Body() product: ProductReceived,
        @UploadedFiles() files: Express.Multer.File[],
    ): Promise<ProductReceived> {
        console.log('Received product:', product);
        console.log('Received files:', files);
        console.log('Entering createProduct method');
        return this.adminService.createProduct(product, files);
    }


    @Put('/product/update')
    @UseInterceptors(AnyFilesInterceptor())
    async updateProduct(
        @Body() product: EditProductReceived,
        @UploadedFiles() files: Express.Multer.File[],
    ): Promise<EditProductReceived>{
        console.log('Received product:', product);
        console.log('Received files:', files);
        console.log('Entering editProduct method');
        return this.adminService.updateProduct(product, files);
    }

    @Delete('/product/delete/color')
    async deleteByColor(@Body() productId: DeleteProductId  ):Promise<DeleteProductId >{
        console.log('Received product Id:', productId)
        return this.adminService.deleteColor(productId)
    }

    @Delete('/product/delete/generalProduct')
    async deleteGeneralProduct(@Body()  productId: DeleteProductId ):Promise <DeleteProductId>{
        console.log('Received product Id:', productId)
        return this.adminService.deleteGeneralProduct(productId)
    }

}
