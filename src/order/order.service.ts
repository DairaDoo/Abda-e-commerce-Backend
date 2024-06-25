import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CartDisplayDto, OrderForm } from 'src/dto/order-list';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async createOrder(userId: number, orderForm: OrderForm): Promise<any> {
    let cartItems = []; 
    try {
      const result = await this.prisma.$transaction(async prisma => {
        const address = await prisma.adress.create({
          data: {
            user_id: userId,
            adress: orderForm.address,
            city: orderForm.city,
            state: orderForm.state,
            zip_code: orderForm.zip_code
          }
        });
  
        cartItems = await prisma.cartItem.findMany({
          where: { cart: { user_id: userId } },
          include: {
            product: {
              include: {
                GeneralProduct: true, 
                Color: true,         
                Size_Amount: {
                  include: {
                    Size: true  
                  }
                }
              }
            }
          }
        });
  
        if (cartItems.length === 0) {
          throw new HttpException('No cart items found', HttpStatus.BAD_REQUEST);
        }
  
        const order = await prisma.order.create({
          data: {
            address_id: address.adress_id,
            user_id: userId,
            purchased_products: cartItems.length,
            order_total: cartItems.reduce((acc, item) => acc + item.product.value * item.product_quantity, 0),
          },
        });
  
        await Promise.all(cartItems.map(item =>
          prisma.product_Order.create({
            data: {
              order_id: order.order_id,
              product_id: item.product_id,
              product_quantity: item.product_quantity,
              product_total: item.product.value * item.product_quantity,
            }
          })
        ));

        await this.updateProductStock(cartItems);
  
        await prisma.cart.update({
          where: { user_id: userId },
          data: { cartItems: { deleteMany: {} }, cart_total_price: 0 }
        });
  
        return order;
      });
  
      const user = await this.prisma.user.findUnique({ where: { user_id: userId } });
      if (user && user.email) {
        const emailContent = this.buildOrderConfirmationEmail(result, cartItems);
        const emailSent = await this.mailService.send(user.email, 'New Order Notification', emailContent);
        if (!emailSent) {
          console.error('Failed to send order notification email.');
        }
      }
  
      return result;
    } catch (error) {
      throw new HttpException(`Failed to process order: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private buildOrderConfirmationEmail(order, cartItems): string {
    const itemsHtml = cartItems.map(item => `
      <img src="${item.product.image_url}" alt="${item.product.GeneralProduct.general_product_name}" style="width:100px;height:auto;">
      <li> Product: ${item.product.GeneralProduct.general_product_name} - Color: ${item.product.Color.color_name} - Size: ${item.product.Size_Amount.Size.size_type}: - Quantity: ${item.product_quantity} x $${item.product.value.toFixed(2)} = $${(item.product_quantity * item.product.value).toFixed(2)}</li>
    `).join('');
  
    return `
      <h1>Order Confirmation</h1>
      <p>Your order with the ID #${order.order_id} has been successfully processed.</p>
      <p>Details:</p>
      <ul>${itemsHtml}</ul>
      <p>Total Order Value: $${order.order_total.toFixed(2)}</p>
      <p>Thank you for your order!</p>
    `;
  }



  async updateProductStock(cartItems: CartDisplayDto[]): Promise<void> {
    console.log('Items to reduce stock: ', cartItems)
    try {
      await this.prisma.$transaction(async prisma => {
        for (const item of cartItems) {
          const product = await prisma.product.findUnique({
            where: { product_id: item.product_id },
            include: { Size_Amount: true }
          });

          if (product && product.Size_Amount) {
            await prisma.size_Amount.update({
              where: { size_amount_id: product.size_amount_id },
              data: { size_amount: { decrement: item.product_quantity } }
            });
          }
        }
      });
    } catch (error) {
      console.error('Failed to update product stock:', error);
      throw new HttpException('Failed to update product stock', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
}
