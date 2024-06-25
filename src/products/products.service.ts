
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GeneralProductDTO } from 'src/dto/products_dto';


@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) {}

    async getAllProducts(): Promise<GeneralProductDTO[]> {
        const products = await this.prisma.generalProduct.findMany({
            include: {
                Brand: true,
                Section: true, 
                products: {
                    include: {
                        Color: true, 
                        Size_Amount: { 
                            include: {
                                Size: true 
                            }
                        },
                    }
                },
            }
        });

        return products.map((gp) => ({
            general_product_id: gp.general_product_id,
            brand: {
                brand_id: gp.Brand.brand_id,
                brand_name: gp.Brand.brand_name 
            },
            section: { 
                section_id: gp.Section.section_id,
                section_name: gp.Section.section_name
            },
            general_product_name: gp.general_product_name,
            description: gp.description, 
            products: gp.products.map((p) => ({
                product_id: p.product_id,
                value: p.value,
                image_url: p.image_url,
                hover_image_url: p.hover_image_url ,
                color: {
                    color_id: p.Color.color_id, 
                    color_name: p.Color.color_name, 
                },
                size_amount: {
                    size_amount_id: p.Size_Amount.size_amount_id,
                    size_amount: p.Size_Amount.size_amount 
                },
                size: {
                    size_id: p.Size_Amount.Size.size_id, 
                    size_name: p.Size_Amount.Size.size_type },

            }))
        }));
    }



    async getMenProducts(): Promise<GeneralProductDTO[]> {
        const products = await this.prisma.generalProduct.findMany({
            where: {section_id: 1 },
            include: {
                Brand: true,
                Section: true, 
                products: {
                    include: {
                        Color: true, 
                        Size_Amount: { 
                            include: {
                                Size: true 
                            }
                        },
                    }
                },
            }
        });

        return products.map((gp) => ({
            general_product_id: gp.general_product_id,
            brand: {
                brand_id: gp.Brand.brand_id,
                brand_name: gp.Brand.brand_name 
            },
            section: { 
                section_id: gp.Section.section_id,
                section_name: gp.Section.section_name
            },
            general_product_name: gp.general_product_name,
            description: gp.description, 
            products: gp.products.map((p) => ({
                product_id: p.product_id,
                value: p.value,
                image_url: p.image_url,
                hover_image_url: p.hover_image_url ,
                color: {
                    color_id: p.Color.color_id, 
                    color_name: p.Color.color_name, 
                },
                size_amount: {
                    size_amount_id: p.Size_Amount.size_amount_id,
                    size_amount: p.Size_Amount.size_amount 
                },
                size: {
                    size_id: p.Size_Amount.Size.size_id, 
                    size_name: p.Size_Amount.Size.size_type },

            }))
        }));
    }



    async getWomenProducts(): Promise<GeneralProductDTO[]> {
        const products = await this.prisma.generalProduct.findMany({
            where: {section_id: 2 },
            include: {
                Brand: true,
                Section: true, 
                products: {
                    include: {
                        Color: true, 
                        Size_Amount: { 
                            include: {
                                Size: true 
                            }
                        },
                    }
                },
            }
        });

        return products.map((gp) => ({
            general_product_id: gp.general_product_id,
            brand: {
                brand_id: gp.Brand.brand_id,
                brand_name: gp.Brand.brand_name 
            },
            section: { 
                section_id: gp.Section.section_id,
                section_name: gp.Section.section_name
            },
            general_product_name: gp.general_product_name,
            description: gp.description, 
            products: gp.products.map((p) => ({
                product_id: p.product_id,
                value: p.value,
                image_url: p.image_url,
                hover_image_url: p.hover_image_url ,
                color: {
                    color_id: p.Color.color_id, 
                    color_name: p.Color.color_name, 
                },
                size_amount: {
                    size_amount_id: p.Size_Amount.size_amount_id,
                    size_amount: p.Size_Amount.size_amount 
                },
                size: {
                    size_id: p.Size_Amount.Size.size_id, 
                    size_name: p.Size_Amount.Size.size_type },

            }))
        }));
    }



    async getProductById(id: number): Promise<GeneralProductDTO[]> {
        console.log("Getting product by Id:", id);

        const productId = parseInt(id.toString(), 10);
    
        const productVariant = await this.prisma.product.findFirst({
            where: { product_id: productId }
        });
    
        if (!productVariant) {
            throw new Error(`Product with ID ${productId} not found`);
        }

    
        const products = await this.prisma.generalProduct.findMany({
            where: { general_product_id: productVariant.general_product_id },
            include: {
                Brand: true,
                Section: true,
                products: {
                    include: {
                        Color: true,
                        Size_Amount: {
                            include: {
                                Size: true
                            }
                        },
                    }
                },
            }
        });
    
         const GeneralProduct = products.map((gp) => ({
            general_product_id: gp.general_product_id,
            brand: {
                brand_id: gp.Brand.brand_id,
                brand_name: gp.Brand.brand_name
            },
            section: {
                section_id: gp.Section.section_id,
                section_name: gp.Section.section_name
            },
            general_product_name: gp.general_product_name,
            description: gp.description,
            products: gp.products.map((p) => ({
                product_id: p.product_id,
                value: p.value,
                image_url: p.image_url,
                hover_image_url: p.hover_image_url,
                color: {
                    color_id: p.Color.color_id,
                    color_name: p.Color.color_name,
                },
                size_amount: {
                    size_amount_id: p.Size_Amount.size_amount_id,
                    size_amount: p.Size_Amount.size_amount
                },
                size: {
                    size_id: p.Size_Amount.Size.size_id,
                    size_name: p.Size_Amount.Size.size_type
                },
            }))
        }));
        console.log(GeneralProduct)
        
        return GeneralProduct
    }
    async setWantedProductCount(productVariantId: number) {
        console.log("Setting wanted count for product variant ID:", productVariantId);
    
        const productVariant = await this.prisma.product.findUnique({
            where: { product_id: productVariantId }
        });
    
        if (!productVariant) {
            throw new Error(`Product variant with ID ${productVariantId} not found`);
        }
    
        // Now using the general_product_id from the productVariant
        const generalProductId = productVariant.general_product_id;
    
        const wantedProduct = await this.prisma.wantedProduct.upsert({
            where: { general_product_id: generalProductId },
            update: {
                most_wanted_product_count: {
                    increment: 1
                }
            },
            create: {
                general_product_id: generalProductId,
                most_wanted_product_count: 1
            }
        });
    
        console.log("Wanted product count updated for general product ID:", generalProductId);
    
        return { message: "Wanted product count updated", product: wantedProduct };
    }
    
    async getWantedProducts(): Promise<GeneralProductDTO[]> {
        const products = await this.prisma.generalProduct.findMany({
            include: {
                Brand: true,
                Section: true, 
                products: {
                    include: {
                        Color: true, 
                        Size_Amount: { 
                            include: {
                                Size: true 
                            }
                        },
                    },
                },
                wantedproducts: true  // Include wantedproducts relation
            }
        });

        products.sort((a, b) => {
            const countA = a.wantedproducts?.most_wanted_product_count ?? 0;
            const countB = b.wantedproducts?.most_wanted_product_count ?? 0;
            // Sort by count descending, but if counts are equal, sort by general_product_id ascending
            return countB !== countA ? countB - countA : a.general_product_id - b.general_product_id;
        });
    
        const wantedOrder = products.map((gp) => ({
            general_product_id: gp.general_product_id,
            general_product_name: gp.general_product_name,
            description: gp.description,
            section: {
                section_id: gp.Section.section_id,
                section_name: gp.Section.section_name
            },
            brand: {
                brand_id: gp.Brand.brand_id,
                brand_name: gp.Brand.brand_name
            },
            products: gp.products.map((p) => ({
                product_id: p.product_id,
                value: p.value,
                color: {
                    color_id: p.Color.color_id,
                    color_name: p.Color.color_name
                },
                image_url: p.image_url,
                hover_image_url: p.hover_image_url,
                size_amount: {
                    size_amount_id: p.Size_Amount.size_amount_id,
                    size_amount: p.Size_Amount.size_amount
                },
                size: {
                    size_id: p.Size_Amount.Size.size_id,
                    size_name: p.Size_Amount.Size.size_type
                }
            })),
            wantedCount: gp.wantedproducts?.most_wanted_product_count || 0 
        }));
        console.log(wantedOrder)

        return wantedOrder
    }
}
