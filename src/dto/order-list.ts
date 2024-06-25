export class Order {
    readonly products: CartDisplayDto[];
    readonly address: string;
    readonly city: string;
    readonly state: string;
    readonly zip_code: string;
    readonly order_total: number;
}

export class CartDisplayDto {
    readonly product_id: number;
    readonly product_price: number;
    readonly quantity: number; 
    readonly product_quantity?: number; // provisional solution for 
    readonly size_available: number;
    readonly image_url: string;
  }
  

  export class OrderForm {
    readonly address: string;
    readonly city: string;
    readonly state: string;
    readonly zip_code: string;
}
