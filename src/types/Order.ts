export interface CartItem {
         _id: string;
         name: string;
         price: number;
         quantity: number;
         color?: string; // thêm vì bạn dùng ở UI
         originalPrice?: number; // thêm vì bạn check có gạch giá gốc
       }
       
       export interface Order {
         _id: string;
         orderId: string;
         transactionId?: string;
         amount: number;
         status: string;
         paymentMethod: "TRANSFER" | "CASH";
         createdAt: string;
         cartItems: CartItem[];
         customerInfo: {
           fullName: string;
           address: string;
           province: string;
           phone: string;
           email: string;
           note?: string;
         };
       }
       