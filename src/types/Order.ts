export interface ShippingInfo {
  name: string;
  type: "free" | "percentage" | "amount";
}

export interface OrderTotalAmount {
  subTotal: number;
  tax?: number;
  shipping?: ShippingInfo;
  discount: number;
  total: number;
}

export interface Commission {
  type: "percentage" | "fixed";
  value: number;
  amount: number;
}

export interface OrderItem {
  orderBy: string;
  shopInfo: string;
  status?: string;
  productInfo: string;
  trackingNumber: string;
  isCancelled: boolean;
  quantity: number;
  totalAmount: OrderTotalAmount;
  commission?: Commission;
}

export interface CustomerInfo {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  address: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface Order {
  _id: string;
  userRole: string;
  orderBy: {
    _id: string;
    name: string;
    email?: string;
  };
  trackingNumber: string;
  orderInfo: OrderItem[];
  customerInfo: CustomerInfo;
  paymentInfo: string | { cardNumber?: string; nameOnCard?: string };
  status?: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  totalQuantity?: number;
  totalCommission?: number;
  commissionRate?: number;
  averagePercentageRate?: number;
}

// Admin-specific order interfaces
export interface AdminOrderItem {
  productInfo: string;
  quantity: number;
  totalAmount: {
    subTotal: number;
    discount: number;
    total: number;
    shipping?: { name: string; type: "free" | "percentage" | "amount" };
  };
  commission: {
    type: "percentage" | "fixed";
    value: number;
    amount: number;
  };
}

export interface AdminOrderPayload {
  orderSource: "phone" | "walk-in" | "online" | "whatsapp" | "facebook";
  customerInfo: {
    fullName: string;
    phone: string;
    address: string;
    email?: string;
    city?: string;
    country?: string;
  };
  orderInfo: AdminOrderItem[];
  paymentInfo: "cash-on" | { cardNumber?: string; nameOnCard?: string };
  status?: "pending" | "paid" | "processing";
  totalAmount: number;
  adminNotes?: string;
  customerType?: "new" | "existing" | "guest";
  assignedSR?: string;
}
