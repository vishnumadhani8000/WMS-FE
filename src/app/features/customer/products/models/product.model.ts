
export interface Product {
    id: number;
    name: string;
    description: string;
    price:number;
  }
    
  export interface AddToCartDto {
  
    productId: number;
    quantity: number;
  }
  