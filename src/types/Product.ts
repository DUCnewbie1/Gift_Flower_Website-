export interface ProductType {
    description: string;
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    image: string; 
    basePrice?: number;
    additionalPrice?: number;
    regionalStock?: number;
    category?: string;
    forRooms?: string[];
    occasions?: string[];
    code?: string;
    averageRating?: number;
    totalReviews?: number;
    
}