export interface ProductType {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount: number | string;
  image: string;
  forRooms?: string[];
  occasions?: string[];
  code?: string;
  regionalStock?: number;
  basePrice?: number; 
  additionalPrice?: number;
}

export interface CartItem extends ProductType {
  quantity: number;
}