import { Injectable } from '@nestjs/common';
import { CartDisplayDto } from 'src/dto/cart-item.dto';
import { SizeDTO } from 'src/dto/products_dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // Método para añadir un producto al carrito de un usuario
  async addToCart(userId: number, productId: number, quantity: number): Promise<void> {
    console.log('Agregando Producto: ', productId)
    // Buscar si el usuario ya tiene un carrito
    let cart = await this.prisma.cart.findUnique({
      where: { user_id: userId },
    });

    // Si no existe un carrito, crear uno nuevo con precio total inicial de 0
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          user_id: userId,
          cart_total_price: 0,
        },
      });
    }

    // Buscar si el producto ya está en el carrito
    let cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cart_id_product_id: {
          cart_id: cart.cart_id,
          product_id: productId,
        },
      },
    });

    // Si el producto ya está en el carrito, incrementar la cantidad
    if (cartItem) {
      await this.prisma.cartItem.update({
        where: {
          cart_item_id: cartItem.cart_item_id,
        },
        data: {
          product_quantity: {
            increment: quantity,
          },
        },
      });
    } else {
      // Si el producto no está en el carrito, agregarlo con la cantidad especificada
      await this.prisma.cartItem.create({
        data: {
          cart: {
            connect: { cart_id: cart.cart_id },
          },
          product: {
            connect: { product_id: productId },
          },
          product_price: 0, // El precio se inicializa en 0 y se actualizará más adelante
          product_quantity: quantity,
        },
      });
    }

    // Buscar el producto para obtener su precio
    const product = await this.prisma.product.findUnique({
      where: { product_id: productId },
    });

    // Si el producto no se encuentra, lanzar un error
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // Calcular el precio total del producto basado en la cantidad y actualizar el carrito
    const productTotalPrice = product.value * quantity;

    await this.prisma.cart.update({
      where: { cart_id: cart.cart_id },
      data: { cart_total_price: { increment: productTotalPrice } },
    });
  }

  
  async getCartInfo(userId: number): Promise<CartDisplayDto[]> {
    console.log('Getting cart info')
    const cartItems = await this.prisma.cartItem.findMany({
      where: { cart: { user_id: userId } },
      include: {
        product: {
          include: {
            Size_Amount:{ 
              include: {
                  Size: true 
              }
          }
          },
        },
      },
    });

    const cartToReturn = cartItems.map(item => ({
      product_id: item.product_id,
      product_price: item.product.value,
      quantity: item.product_quantity,
      size: item.product.Size_Amount.Size.size_type,
      size_available: item.product.Size_Amount.size_amount, // Accede a la propiedad size_amount
      image_url: item.product.image_url,
    }));

    console.log(cartToReturn);
  
    return cartToReturn

  }


  async deleteCartItem(userId: number, productId: number): Promise<void> {
    // Buscar el carrito del usuario
    const cart = await this.prisma.cart.findUnique({
      where: { user_id: userId },
    });
  
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }
  
    // Buscar el elemento del carrito para eliminar
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cart_id_product_id: {
          cart_id: cart.cart_id,
          product_id: productId,
        },
      },
    });
  
    if (!cartItem) {
      throw new Error('Elemento del carrito no encontrado');
    }
  
    // Eliminar el elemento del carrito
    await this.prisma.cartItem.delete({
      where: {
        cart_item_id: cartItem.cart_item_id,
      },
    });
  
    // Actualizar el precio total del carrito
    const productTotalPrice = cartItem.product_price * cartItem.product_quantity;
    await this.prisma.cart.update({
      where: { cart_id: cart.cart_id },
      data: { cart_total_price: { decrement: productTotalPrice } },
    });
  }

  async resetCart(){
    return ;

    //Se debe Devolver un mensaje de exito / error. Similar a:
    // return response.status(HttpStatus.OK).json({ message: 'Product added to cart successfully' });
    // return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error: error.message });
    //pero NO Http Status
  }

  async getCartItemCount(userId: number): Promise<number> {
    console.log('Obteniendo cantidad de elementos en el carrito');
    const cart = await this.prisma.cart.findUnique({
      where: { user_id: userId },
      include: { cartItems: true }, // Cargar explícitamente los elementos del carrito
    });
  
    if (!cart) {
      return 0; // Si no hay carrito, retorna 0
    }
  
    // Sumar la cantidad de cada elemento en el carrito
    const itemCount = cart.cartItems.reduce((total, item) => total + item.product_quantity, 0);
    console.log('Cantidad de elementos en el carrito:', itemCount);
    return itemCount;
  }
  
  
}
