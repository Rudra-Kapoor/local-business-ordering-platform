export type Role = "customer" | "shopOwner" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Shop = {
  _id: string;
  shopName: string;
  ownerId: string;
  location: { address: string; latitude?: number; longitude?: number };
  category: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  _id: string;
  shopId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Order = {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  shopId:
    | string
    | {
        _id: string;
        shopName: string;
        category: string;
        location: { address: string; latitude?: number; longitude?: number };
      };
  products: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryAddress?: string;
  createdAt: string;
  updatedAt: string;
};

