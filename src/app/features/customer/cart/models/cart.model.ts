  export interface CartItem {
      cartItemId: number;  
      productId: number;
      productName: string;
      price:number;
      quantity: number;
      availableStock: number;  
    }
    export interface CartResponseDto {
      cartId: number;        
      userId: number;
      totalWeightKg: number;
      items: CartItem[];     
    }
    
    export interface AddToCartDto {
      productId: number;
      quantity: number;
    }
    
    export interface UpdateCartItemQuantityDto {
      quantity: number;
    }
    export interface CheckoutOrderItem {
      id: number;
      name: string;
      quantity: number;
      unitPrice: number;
    }
    
    export interface CheckoutAddress {
      addressId: number;
      addressLine: string;
      landmark?: string;
      cityName: string;
      stateName: string;
      pincode: string;
    }