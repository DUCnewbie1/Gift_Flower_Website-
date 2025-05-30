export interface ProductType {
    description: string;
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    image: string; 
    category?: string;
    forRooms?: string[];
    occasions?: string[];
    code?: string;
    averageRating?: number;
    totalReviews?: number;
}