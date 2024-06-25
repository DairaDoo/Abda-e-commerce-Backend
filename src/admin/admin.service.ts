import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ProductReceived } from "src/dto/product_recived";
import { EditProductReceived } from "src/dto/product_edit_recived";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { DeleteProductId } from "src/dto/product_edit_recived";

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinary: CloudinaryService
    ) {}

    async createProduct(data: ProductReceived, files: Express.Multer.File[]): Promise<ProductReceived> {
        try {
            let existingBrandName = await this.prisma.brand.findFirst({
                where: { brand_name: data.brand_name }
            });
            console.log('Existing brand:', existingBrandName);

            if (!existingBrandName) {
                existingBrandName = await this.prisma.brand.create({
                    data: { brand_name: data.brand_name }
                });
                console.log('Brand created:', existingBrandName);
            }

            let sectionEntity = await this.prisma.section.findFirst({ where: { section_name: data.section } });
            console.log('Existing section:', sectionEntity);

            if (!sectionEntity) {
                sectionEntity = await this.prisma.section.create({ data: { section_name: data.section } });
                console.log('Section created:', sectionEntity);
            }

            let existingGeneralProduct = await this.prisma.generalProduct.findFirst({
                where: { general_product_name: data.general_product_name },
            });
            console.log('Existing general product:', existingGeneralProduct);

            if (!existingGeneralProduct) {
                existingGeneralProduct = await this.prisma.generalProduct.create({
                    data: {
                        general_product_name: data.general_product_name,
                        brand_id: existingBrandName.brand_id,
                        description: data.description,
                        section_id: sectionEntity.section_id,
                    },
                });
                console.log('General product created:', existingGeneralProduct);
            }

            for (const [index, variant] of data.products.entries()) {
                let color = await this.prisma.color.findUnique({
                    where: { color_name: variant.color_name }
                });
                if (!color) {
                    color = await this.prisma.color.create({
                        data: { color_name: variant.color_name }
                    });
                    console.log('Color created:', color);
                }

                const mainImageFile = files.find(file => file.fieldname === `products[${index}][imageFile]`);
                const hoverImageFile = files.find(file => file.fieldname === `products[${index}][hoverImageFile]`);
            
                let mainImageUrl = '';
                let hoverImageUrl = '';

                if (mainImageFile) {
                    mainImageUrl = await this.cloudinary.uploadAndGetUrl(mainImageFile);
                    console.log('Main image uploaded:', mainImageUrl);
                }

                if (hoverImageFile) {
                    hoverImageUrl = await this.cloudinary.uploadAndGetUrl(hoverImageFile);
                    console.log('Hover image uploaded:', hoverImageUrl);
                }
            
                for (const sizeType of Object.keys(variant.sizes)) {
                    console.log('Processing size type:', sizeType);
                
                    const sizeEntity = await this.prisma.size.findUnique({
                        where: { size_type: sizeType }
                    });
                    console.log('Retrieved size entity:', sizeEntity);
                
                    if (sizeEntity) {
                        const sizeAmount = await this.prisma.size_Amount.create({
                            data: {
                                size_id: sizeEntity.size_id, // Use the retrieved size_id dynamically
                                size_amount: parseInt(variant.sizes[sizeType] )
                            }
                        });
                        console.log('Created size amount:', sizeAmount);
                
                        const product = await this.prisma.product.create({
                            data: {
                                value: parseFloat(variant.value),
                                color_id: color.color_id,
                                general_product_id: existingGeneralProduct.general_product_id,
                                image_url: mainImageUrl, 
                                hover_image_url: hoverImageUrl,
                                size_amount_id: sizeAmount.size_amount_id
                            }
                        });
                        console.log('Product created:', product);
                    } else {
                        console.log('Size entity not found for size type:', sizeType);
                    }
                }
            }

            return data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw new HttpException('Failed to create product', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateProduct(data: EditProductReceived, files: Express.Multer.File[]): Promise<EditProductReceived> {
      try {
          // Convertir general_product_id a número
          const general_product_id = parseInt(data.general_product_id);
          const { general_product_name, brand_name, description, section, products } = data;
          console.log("Editing Product", general_product_name);
          console.log("General Information", general_product_id, brand_name, description, section);
  
          const product = products[0];
          const { value, color_name, imageUrl, hoverImageUrl, product_ids, sizes } = product;
  
          console.log("Product Variation");
          console.log("Value:", value);
          console.log("Color:", color_name);
          console.log("Image URL:", imageUrl);
          console.log("Hover Image URL:", hoverImageUrl);
  
          // Convertir product_ids y sizes a números si es necesario
          const productIdS = Number(product_ids.S);
          const productIdM = Number(product_ids.M);
          const productIdL = Number(product_ids.L);
          const productIdXL = Number(product_ids.XL);
  
          const sizeS = Number(sizes.S);
          const sizeM = Number(sizes.M);
          const sizeL = Number(sizes.L);
          const sizeXL = Number(sizes.XL);
  
          console.log("Product IDs:", productIdS, productIdM, productIdL, productIdXL);
          console.log("Sizes:", sizeS, sizeM, sizeL, sizeXL);
  
          const existingGeneralProduct = await this.prisma.generalProduct.findUnique({
              where: { general_product_id: general_product_id },
              include: { products: true },
          });
  
          console.log(existingGeneralProduct);
  
          if (!existingGeneralProduct) {
              throw new Error(`GeneralProduct with ID ${general_product_id} not found`);
          }
  
          // Buscar o crear el Brand
          let brand = await this.prisma.brand.findFirst({
              where: { brand_name: brand_name },
          });
  
          if (!brand) {
              brand = await this.prisma.brand.create({
                  data: { brand_name: brand_name },
              });
              console.log(`Created new brand with ID: ${brand.brand_id}`);
          } else {
              console.log(`Found brand with ID: ${brand.brand_id}`);
          }
  
          // Buscar o crear la Section
          let sectionRecord = await this.prisma.section.findFirst({
              where: { section_name: section },
          });
  
          if (!sectionRecord) {
              sectionRecord = await this.prisma.section.create({
                  data: { section_name: section },
              });
              console.log(`Created new section with ID: ${sectionRecord.section_id}`);
          } else {
              console.log(`Found section with ID: ${sectionRecord.section_id}`);
          }
  
          // Buscar o crear el Color
          let color = await this.prisma.color.findFirst({
              where: { color_name: color_name },
          });
  
          if (!color) {
              color = await this.prisma.color.create({
                  data: { color_name: color_name },
              });
              console.log(`Created new color with ID: ${color.color_id}`);
          } else {
              console.log(`Found color with ID: ${color.color_id}`);
          }
  
          let newGeneralProductId = general_product_id;
  
          // Si la sección ha cambiado, crear un nuevo GeneralProduct para la nueva sección
          if (existingGeneralProduct.section_id !== sectionRecord.section_id) {
              // Crear un nuevo GeneralProduct para la nueva sección
              const newGeneralProduct = await this.prisma.generalProduct.create({
                  data: {
                      general_product_name: existingGeneralProduct.general_product_name,
                      description: existingGeneralProduct.description,
                      brand_id: existingGeneralProduct.brand_id,
                      section_id: sectionRecord.section_id,
                  },
              });
              newGeneralProductId = newGeneralProduct.general_product_id;
              console.log(`Created new GeneralProduct with ID: ${newGeneralProductId}`);
  
              // Actualizar solo los productos seleccionados para que apunten al nuevo GeneralProduct
              await this.prisma.product.updateMany({
                  where: {
                      product_id: {
                          in: [productIdS, productIdM, productIdL, productIdXL],
                      },
                  },
                  data: {
                      general_product_id: newGeneralProductId,
                  },
              });
  
              console.log(`Moved selected products to new GeneralProduct with ID: ${newGeneralProductId}`);
  
              // Eliminar el GeneralProduct original si ya no tiene productos
              const remainingProducts = await this.prisma.product.findMany({
                  where: { general_product_id: general_product_id },
              });
  
              if (remainingProducts.length === 0) {
                  await this.prisma.generalProduct.delete({
                      where: { general_product_id: general_product_id },
                  });
                  console.log(`Deleted GeneralProduct with ID: ${general_product_id} because it has no more products.`);
              }
          }
  
          // Función para actualizar productos con imágenes
          const updateProductWithImages = async (productId: number, sizeAmount: number, index: number) => {
              const product = await this.prisma.product.findUnique({
                  where: { product_id: productId },
                  include: { Size_Amount: true },
              });
  
              if (!product) {
                  throw new Error(`Product with ID ${productId} not found`);
              }
  
              const sizeId = product.Size_Amount.size_id;
  
              const mainImageFile = files.find(file => file.fieldname === `products[${index}][imageFile]`);
              const hoverImageFile = files.find(file => file.fieldname === `products[${index}][hoverImageFile]`);
  
              let mainImageUrl = product.image_url;
              let hoverImageUrl = product.hover_image_url;
  
              if (mainImageFile) {
                  mainImageUrl = await this.cloudinary.uploadAndGetUrl(mainImageFile);
                  console.log('Main image uploaded:', mainImageUrl);
              }
  
              if (hoverImageFile) {
                  hoverImageUrl = await this.cloudinary.uploadAndGetUrl(hoverImageFile);
                  console.log('Hover image uploaded:', hoverImageUrl);
              }
  
              await this.prisma.product.update({
                  where: { product_id: productId },
                  data: {
                      value: parseFloat(value), // Convertir value a float
                      image_url: mainImageUrl,
                      hover_image_url: hoverImageUrl,
                      Color: {
                          connect: { color_id: color.color_id },
                      },
                      Size_Amount: {
                          update: {
                              where: { size_id: sizeId },
                              data: { size_amount: sizeAmount },
                          },
                      },
                  },
              });
          };
  
          // Actualizar productos con sus imágenes correspondientes
          await updateProductWithImages(productIdS, sizeS, 0);
          await updateProductWithImages(productIdM, sizeM, 1);
          await updateProductWithImages(productIdL, sizeL, 2);
          await updateProductWithImages(productIdXL, sizeXL, 3);
  
          // Unificar GeneralProduct si hay productos con el mismo nombre y atributos coincidentes
          const generalProductsWithSameName = await this.prisma.generalProduct.findMany({
              where: {
                  general_product_name: general_product_name,
                  description: description,
                  brand_id: brand.brand_id,
                  section_id: sectionRecord.section_id,
              },
              include: { products: true },
          });
  
          if (generalProductsWithSameName.length > 1) {
              const mainGeneralProduct = generalProductsWithSameName.find(gp => gp.general_product_id !== newGeneralProductId);
              if (mainGeneralProduct) {
                  const productsToUnify = generalProductsWithSameName.filter(gp => gp.general_product_id !== mainGeneralProduct.general_product_id);
  
                  for (const gp of productsToUnify) {
                      await this.prisma.product.updateMany({
                          where: { general_product_id: gp.general_product_id },
                          data: { general_product_id: mainGeneralProduct.general_product_id },
                      });
  
                      await this.prisma.generalProduct.delete({
                          where: { general_product_id: gp.general_product_id },
                      });
                  }
  
                  console.log(`Unified ${productsToUnify.length + 1} GeneralProducts into one with ID: ${mainGeneralProduct.general_product_id}`);
              }
          }
  
          // Actualizar el generalProduct con los nuevos datos
          await this.prisma.generalProduct.update({
              where: { general_product_id: newGeneralProductId },
              data: {
                  general_product_name,
                  description,
                  Brand: {
                      connect: { brand_id: brand.brand_id },
                  },
                  Section: {
                      connect: { section_id: sectionRecord.section_id },
                  },
              },
          });
  
          console.log("Products and GeneralProduct updated successfully");
      } catch (error) {
          console.error("Error updating product:", error);
      }
      return data;
  }
  
  
  
  
  
  async deleteColor(data: DeleteProductId): Promise<DeleteProductId> {
    const { general_product_id, color_id } = data;

    console.log(`deleteColor called with general_product_id: ${general_product_id}, color_id: ${color_id}`);

    if (!color_id) {
        console.log('Color ID is required for deleting a color.');
        throw new BadRequestException('Color ID is required for deleting a color.');
    }

    // Find all products with the given general_product_id and color_id
    const products = await this.prisma.product.findMany({
        where: {
            general_product_id: Number(general_product_id),
            color_id: Number(color_id),
        },
    });

    console.log(`Found products: ${JSON.stringify(products)}`);

    for (const product of products) {
        // Check if the product has related orders or cart items
        const relatedOrders = await this.prisma.product_Order.findMany({
            where: {
                product_id: product.product_id,
            },
        });

        const relatedCartItems = await this.prisma.cartItem.findMany({
            where: {
                product_id: product.product_id,
            },
        });

        console.log(`Product ID ${product.product_id} has related orders: ${JSON.stringify(relatedOrders)}`);
        console.log(`Product ID ${product.product_id} has related cart items: ${JSON.stringify(relatedCartItems)}`);

        if (relatedOrders.length > 0 || relatedCartItems.length > 0) {
            console.log(`Cannot delete product ID ${product.product_id} because there are related orders or cart items.`);
            throw new BadRequestException(
                `Cannot delete product ID ${product.product_id} because there are related orders or cart items.`
            );
        }
    }

    // Delete related products
    const deleteResult = await this.prisma.product.deleteMany({
        where: {
            general_product_id: Number(general_product_id),
            color_id: Number(color_id),
        },
    });

    console.log(`Deleted products result: ${JSON.stringify(deleteResult)}`);

    // Check if there are any remaining products with the same general_product_id
    const remainingProducts = await this.prisma.product.findMany({
        where: {
            general_product_id: Number(general_product_id),
        },
    });

    if (remainingProducts.length === 0) {
        // Delete related wanted product entries
        await this.prisma.wantedProduct.deleteMany({
            where: {
                general_product_id: Number(general_product_id),
            },
        });
        console.log(`Deleted wanted products for general_product_id: ${general_product_id}`);

        // Delete the general product if there are no remaining products
        await this.prisma.generalProduct.delete({
            where: {
                general_product_id: Number(general_product_id),
            },
        });
        console.log(`Deleted general product with general_product_id: ${general_product_id}`);
    }

    return data;
}

async deleteGeneralProduct(data: DeleteProductId): Promise<DeleteProductId> {
  const { general_product_id } = data;

  console.log(`deleteGeneralProduct called with general_product_id: ${general_product_id}`);

  // Find all products with the given general_product_id
  const products = await this.prisma.product.findMany({
      where: {
          general_product_id: Number(general_product_id),
      },
  });

  console.log(`Found products: ${JSON.stringify(products)}`);

  for (const product of products) {
      // Check if the product has related orders or cart items
      const relatedOrders = await this.prisma.product_Order.findMany({
          where: {
              product_id: product.product_id,
          },
      });

      const relatedCartItems = await this.prisma.cartItem.findMany({
          where: {
              product_id: product.product_id,
          },
      });

      console.log(`Product ID ${product.product_id} has related orders: ${JSON.stringify(relatedOrders)}`);
      console.log(`Product ID ${product.product_id} has related cart items: ${JSON.stringify(relatedCartItems)}`);

      if (relatedOrders.length > 0 || relatedCartItems.length > 0) {
          console.log(`Cannot delete product ID ${product.product_id} because there are related orders or cart items.`);
          throw new BadRequestException(
              `Cannot delete product ID ${product.product_id} because there are related orders or cart items.`
          );
      }
  }

  // Delete related products
  const deleteProductsResult = await this.prisma.product.deleteMany({
      where: {
          general_product_id: Number(general_product_id),
      },
  });

  console.log(`Deleted products result: ${JSON.stringify(deleteProductsResult)}`);

  // Delete related wanted product entries
  await this.prisma.wantedProduct.deleteMany({
      where: {
          general_product_id: Number(general_product_id),
      },
  });
  console.log(`Deleted wanted products for general_product_id: ${general_product_id}`);

  // Delete the general product
  const deleteGeneralProductResult = await this.prisma.generalProduct.delete({
      where: {
          general_product_id: Number(general_product_id),
      },
  });

  console.log(`Deleted general product result: ${JSON.stringify(deleteGeneralProductResult)}`);

  return data;
}
}