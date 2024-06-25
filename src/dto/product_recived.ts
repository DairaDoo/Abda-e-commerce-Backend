
export interface ProductReceived {
  general_product_name: string;
  brand_name: string;
  description: string;
  section: string;
  products: {
      value: string;
      color_name: string;  
      image_url?: File  | null; 
      hover_image_url?: File | null ; 
      sizes: SizesObject;
    }[];
  }
  
  type SizesObject = {
    S: number; 
    M: number;
    L: number;
    XL: number;
};