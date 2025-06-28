export interface ProductType {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  image: string;
  forRooms?: string[];
  occasions?: string[];
  code?: string;
}

export interface CartItem extends ProductType {
  quantity: number;
}