// DTOs
export class GeneralProductDTO {
  general_product_id: number;
  brand: BrandDTO;
  general_product_name: string;
  wantedCount?: number;
  description: string;  
  section: SectionDTO;
  products: ProductDTO[];
}
  export class ProductDTO {
    product_id: number;
    value: number;
    image_url: string;
    hover_image_url: string; 
    color: ColorDTO; 
    size_amount: SizeAmountDTO;
  }
  
  
  export class BrandDTO {
    brand_id?: number;
    brand_name: string;
  }
  
  export class ColorDTO {
    color_id: number;
    color_name: string;

  }
  
  export class SectionDTO {
    section_id: number;
    section_name: string;
  }
  
  export class SizeAmountDTO {
    size_amount_id: number;
    size_amount: number;
    size_id?: SizeDTO
  }

  export class SizeDTO {
    size_id: number;      
    size_type: string;
}



// _________________________________
// Dto whitout the other DTO for Color/Size inside
  export class Product {
    product_id: number;
    value: number;
    image_url: string;
    hover_image_url: string; 
    color_id: number; 
    size_amount_id: number;
  }

  export class SizeAmount {
    size_amount_id: number;
    size_amount: number;
    size_id?: number;
  }
  


  