import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import FilterOptions from 'src/dto/filterOptions';
import { GeneralProductDTO } from 'src/dto/products_dto';

@Injectable()
export class FilterService {

    constructor(private prisma: PrismaService) { }
    async filterProducts(filters: FilterOptions): Promise<GeneralProductDTO[]> {
        const { brand, color, section, minValue, maxValue } = filters;
        console.log('Filtros aplicados:', { brand, color, section, minValue, maxValue });
    
    
        const products = await this.prisma.generalProduct.findMany({
            where: {
                ...(brand && { Brand: { brand_name: brand } }),
                ...(section && { Section: { section_name: section } }),
            },
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
    
        console.log('Productos encontrados:', products.length);
    
        return products.map(gp => {
            const filteredProducts = gp.products.filter(p => {
                return (!color || p.Color.color_name === color) &&
                       (minValue === undefined || p.value >= minValue) &&
                       (maxValue === undefined || p.value <= maxValue);
            });
    
            return {
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
                products: filteredProducts.map(p => ({
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
            };
        });
    }


    async getAllBrands() {
        return this.prisma.brand.findMany();
    }

    async getAllColors() {
        return this.prisma.color.findMany();
    }

    async getAllSections() {
        return this.prisma.section.findMany()
    }
}
