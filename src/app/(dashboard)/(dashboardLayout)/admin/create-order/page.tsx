"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingCart, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/featured/auth/authSlice";
import { useCreateAdminOrderMutation } from "@/redux/featured/order/orderApi";
import { useSession } from "next-auth/react";
import { useGetAllProductsQuery } from "@/redux/featured/products/productsApi";
import { Product } from "@/types/Product";
import OrderSourceSelector from "@/components/modules/Dashboard/AdminOrders/OrderSourceSelector";

const customerTypes = [
  { value: "new", label: "New Customer", badge: "default" },
  { value: "existing", label: "Existing Customer", badge: "secondary" },
  { value: "guest", label: "Guest Order", badge: "outline" }
];

const paymentMethods = [
  { value: "cash-on", label: "Cash on Delivery" },
  { value: "card", label: "Card Payment" },
  { value: "mobile-banking", label: "Mobile Banking" }
];

type SelectedProduct = {
  productId: string;
  quantity: number;
  price: number;
  commission: {
    type: "percentage" | "fixed";
    value: number;
  };
};

const AdminCreateOrder = () => {
  const [createAdminOrder, { isLoading: isCreating }] = useCreateAdminOrderMutation();
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: session } = useSession();

  const [searchTerm, setSearchTerm] = useState("");
  const { data: products, isLoading } = useGetAllProductsQuery({
    searchTerm,
    page: 1,
    limit: 50000,
  });

  // Form state
  const [orderSource, setOrderSource] = useState<string>("");
  const [customerType, setCustomerType] = useState<string>("new");
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
    city: "",
    country: "Bangladesh"
  });
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [orderStatus, setOrderStatus] = useState<string>("pending");
  const [adminNotes, setAdminNotes] = useState("");

  const handleAddProduct = (product: Product) => {
    const exists = selectedProducts.find(p => p.productId === product._id);
    if (exists) {
      toast.error("Product already added!");
      return;
    }

    const price = product.productInfo.salePrice || product.productInfo.price;
    const commission = {
      type: (product.commission?.regularType || "fixed") as "percentage" | "fixed",
      value: product.commission?.regularValue || 0
    };

    setSelectedProducts(prev => [...prev, {
      productId: product._id,
      quantity: 1,
      price,
      commission
    }]);

    toast.success(`${product.description.name} added to order`);
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev =>
      prev.map(p => p.productId === productId ? { ...p, quantity } : p)
    );
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  };

  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalCommission = selectedProducts.reduce((sum, item) => {
      const commissionAmount = item.commission.type === "percentage" 
        ? (item.price * item.quantity * item.commission.value) / 100
        : item.commission.value;
      return sum + commissionAmount;
    }, 0);
    
    return { subtotal, totalCommission, total: subtotal };
  };

  const handleCreateOrder = async () => {
    // Validation
    const userId = (session?.user as any)?._id || currentUser?._id;
    
    if (!userId || userId === "admin-temp") {
      toast.error("Please login with a valid account to create orders");
      return;
    }
    if (!orderSource) {
      toast.error("Please select order source");
      return;
    }
    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address) {
      toast.error("Please fill in all required customer information");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select payment method");
      return;
    }

    const { total } = calculateTotals();

    const orderData: any = {
      orderBy: userId,
      userRole: (session?.user as any)?.role || currentUser?.role || "admin",
      orderSource: orderSource as any,
      customerInfo,
      orderInfo: selectedProducts.map(item => ({
        productInfo: item.productId,
        quantity: item.quantity,
        totalAmount: {
          subTotal: item.price * item.quantity,
          discount: 0,
          total: item.price * item.quantity,
        },
        commission: {
          type: item.commission.type,
          value: item.commission.value,
          amount: item.commission.type === "percentage" 
            ? (item.price * item.quantity * item.commission.value) / 100
            : item.commission.value
        }
      })),
      paymentInfo: paymentMethod === "cash-on" ? "cash-on" : { cardNumber: "", nameOnCard: "" },
      status: orderStatus,
      totalAmount: total,
      adminNotes,
      customerType: customerType as any,
    };

    try {
      await createAdminOrder(orderData).unwrap();
      toast.success("Order created successfully!");
      
      // Reset form
      setOrderSource("");
      setCustomerInfo({ fullName: "", phone: "", address: "", email: "", city: "", country: "Bangladesh" });
      setSelectedProducts([]);
      setPaymentMethod("");
      setOrderStatus("pending");
      setAdminNotes("");
      setCustomerType("new");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create order");
    }
  };

  const { subtotal, total } = calculateTotals();

  if (isLoading) return <div>Loading products...</div>;

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Create Admin Order</h1>
        <p className="text-sm sm:text-base text-gray-600">Create orders from multiple sources with commission tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Order Source & Customer Type */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4">Order Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OrderSourceSelector
                  value={orderSource}
                  onChange={setOrderSource}
                  showBadge={true}
                />
                <div>
                  <Label>Customer Type</Label>
                  <Select value={customerType} onValueChange={setCustomerType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {customerTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Address *</Label>
                  <Input
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter full address"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email (optional)"
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4">Add Products</h3>
              <div className="mb-4">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-h-96 overflow-y-auto">
                {products?.filter(p => p.productInfo?.quantity > 0)?.map(product => (
                  <div key={product._id} className="border rounded-lg p-3 md:p-4 flex justify-between items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm md:text-base truncate">{product.description.name}</h4>
                      <p className="text-xs md:text-sm text-gray-600">৳{product.productInfo.salePrice || product.productInfo.price}</p>
                      <p className="text-xs text-gray-500">Stock: {product.productInfo.quantity}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddProduct(product)}
                      disabled={selectedProducts.some(p => p.productId === product._id)}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-4 md:space-y-6">
          {/* Selected Products */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4">Selected Products ({selectedProducts.length})</h3>
              <div className="space-y-2 md:space-y-3">
                {selectedProducts.map(item => {
                  const product = products?.find(p => p._id === item.productId);
                  return (
                    <div key={item.productId} className="border rounded p-2 md:p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-xs md:text-sm line-clamp-2">{product?.description.name}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeProduct(item.productId)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateProductQuantity(item.productId, parseInt(e.target.value) || 1)}
                          className="w-12 md:w-16 h-7 md:h-8 text-xs md:text-sm"
                        />
                        <span className="text-xs md:text-sm">× ৳{item.price}</span>
                      </div>
                      <p className="text-xs md:text-sm font-medium mt-1">৳{item.price * item.quantity}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment & Summary */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4">Payment & Summary</h3>
              
              <div className="mb-4">
                <Label>Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label>Order Status *</Label>
                <Select value={orderStatus} onValueChange={setOrderStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 mb-4 text-sm md:text-base">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>৳{subtotal}</span>
                </div>
               
               {/* <div className="flex justify-between">
                  <span>Commission:</span>
                  <span>৳{totalCommission.toFixed(2)}</span>
                </div>
                 */}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>৳{total}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this order..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleCreateOrder} 
                disabled={isCreating} 
                size="lg" 
                className="w-full"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isCreating ? "Creating Order..." : "Create Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateOrder;