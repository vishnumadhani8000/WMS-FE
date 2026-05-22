
export interface Product {
    id: number;
    name: string;
    description: string;
    weightKg: number;
    stock: number;
  }
    
  export interface AddToCartDto {
  
    productId: number;
    quantity: number;
  }
  