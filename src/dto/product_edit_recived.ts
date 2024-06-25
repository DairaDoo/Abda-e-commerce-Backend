export interface EditProductReceived {
  general_product_id: string; // This is a string in your example, not a number
  general_product_name: string;
  brand_name: string;
  description: string;
  section: string;
  products: ProductDetail[];
}

interface ProductDetail {
  value: string;
  color_name: string;
  imageUrl: string;
  hoverImageUrl: string;
  product_ids: Record<string, number>;
  sizes: Record<string, number>; 
}


export interface DeleteProductId {
  general_product_id: string;
  color_id?: string;
}