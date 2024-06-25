import { Controller, Post, Get, Req, Body, Res,HttpException, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { UserService } from 'src/user/user.service';
import { CartDisplayDto } from 'src/dto/cart-item.dto';
import { Request, Response } from 'express';

@Controller('api/cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly userService: UserService,
  ) {}

  // Controlador para añadir un producto al carrito
  @Post('addToCart')
async addToCart(
    @Req() request: Request,
    @Body('productId') productId: number,
    @Body('quantity') quantity: number,
    @Res() response: Response
): Promise<any> {
    try {
      const user = await this.userService.getUserFromToken(request);
      if (!user) {
        // Improved error messaging
        return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Authentication required: Please log in.' });
      }
      await this.cartService.addToCart(user.user_id, productId, quantity);
      return response.status(HttpStatus.OK).json({ message: 'Product added to cart successfully' });
    } catch (error) {
      console.error("Error when adding to cart:", error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to add product to cart', error: error.message });
    }
}

  // Controlador para obtener la información del carrito
  @Get('getCartInfo')
  async getCartInfo(@Req() request: Request): Promise<CartDisplayDto[]> {
    const user = await this.userService.getUserFromToken(request);
    if (!user) {
      throw new Error('User not authenticated');
    }
    return this.cartService.getCartInfo(user.user_id);
  }

  @Post('deleteCartItem')
  async deleteCartItem(
    @Req() request: Request,
    @Body('productId') productId: number,
    @Res() response: Response
  ): Promise<any> {
    try {
      const user = await this.userService.getUserFromToken(request);
      if (!user) {
        return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Usuario no autenticado' });
      }
      await this.cartService.deleteCartItem(user.user_id, productId);
      return response.status(HttpStatus.OK).json({ message: 'Elemento eliminado del carrito exitosamente' });
    } catch (error) {
      console.error("Error al eliminar el elemento del carrito:", error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error del Servidor Interno', error: error.message });
    }
  }

  @Get('itemCount')
  async getCartItemCount(@Req() request: Request): Promise<number> {
    const user = await this.userService.getUserFromToken(request);
    if (!user) {
      throw new Error('User not authenticated');
    }
    console.log("user id: " , user.user_id);
    return this.cartService.getCartItemCount(user.user_id);
  }

  

}
