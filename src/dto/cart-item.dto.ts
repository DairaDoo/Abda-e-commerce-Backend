export class CartDisplayDto {
  readonly product_id: number;
  readonly product_price: number;
  readonly quantity: number; // Añadido para reflejar la cantidad de cada producto en el carrito
  readonly size_available: number;
  readonly image_url: string;
}

