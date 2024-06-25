import { Body, Controller, Get, Post } from '@nestjs/common';
import { GeneralProductDTO } from 'src/dto/products_dto';
import { ProductsService } from './products.service';


@Controller('api/products')
export class ProductsController {
    constructor( private readonly productsService: ProductsService ){}

    @Get('/wantedProducts')
    async getProducts(): Promise<GeneralProductDTO[]> {
        return this.productsService.getWantedProducts()
    }

    @Get('/men')
    async getMenProducts(): Promise<GeneralProductDTO[]> {
        return this.productsService.getMenProducts()
    }

    
    @Get('/women')
    async getWomenProducts(): Promise<GeneralProductDTO[]> {
        return this.productsService.getWomenProducts()
    }

    @Post('/getProductById')
    async getProductById(@Body('productVariantId') productVariantId: number): Promise<GeneralProductDTO[] | null> {
        console.log("Entering getProductById", productVariantId);
        return this.productsService.getProductById(productVariantId);
    }

    @Post('/addCountMostWanted')
    async setWantedProductCount(@Body('productId') productId: number) {
        console.log("Wanted product recived", productId)
        return this.productsService.setWantedProductCount(productId)
    }
}