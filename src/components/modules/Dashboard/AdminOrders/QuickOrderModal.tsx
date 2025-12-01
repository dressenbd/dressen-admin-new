import React, { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useCreateQuickOrderMutation } from "@/redux/featured/order/orderApi";
import { useGetAllProductsQuery } from "@/redux/featured/products/productsApi";
import { Product } from "@/types/Product";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/featured/auth/authSlice";
import { useSession } from "next-auth/react";

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type QuickOrderItem = {
  productId: string;
  quantity: number;
  price: number;
};

const QuickOrderModal: React.FC<QuickOrderModalProps> = ({ isOpen, onClose }) => {
  const [createQuickOrder, { isLoading }] = useCreateQuickOrderMutation();
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: session } = useSession();
  const { data: products } = useGetAllProductsQuery({
    searchTerm: "",
    page: 1,
    limit: 1000,
  });

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderStatus, setOrderStatus] = useState("pending");
  const [selectedItems, setSelectedItems] = useState<QuickOrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const availableProducts = products?.filter(p => 
    p.productInfo?.quantity > 0 &&
    p.description?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const addProduct = (product: Product) => {
    const exists = selectedItems.find(item => item.productId === product._id);
    if (exists) {
      toast.error("Product already added");
      return;
    }

    const price = product.productInfo.salePrice || product.productInfo.price;
    setSelectedItems(prev => [...prev, {
      productId: product._id,
      quantity: 1,
      price
    }]);
  };

  const updateQuantity = (productId: string, change: number) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeProduct = (productId: string) => {
    setSelectedItems(prev => prev.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = async () => {
    const userId = (session?.user as any)?._id || currentUser?._id;
    
    if (!userId || userId === "admin-temp") {
      toast.error("Please login with a valid account to create orders");
      return;
    }
    if (!customerName || !customerPhone) {
      toast.error("Please enter customer name and phone");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    const orderData: any = {
      orderBy: userId,
      userRole: (session?.user as any)?.role || currentUser?.role || "admin",
      orderSource: "walk-in",
      customerInfo: {
        fullName: customerName,
        phone: customerPhone,
        address: "Walk-in Customer",
        country: "Bangladesh"
      },
      orderInfo: selectedItems.map(item => ({
        productInfo: item.productId,
        quantity: item.quantity,
        totalAmount: {
          subTotal: item.price * item.quantity,
          discount: 0,
          total: item.price * item.quantity,
        },
        commission: {
          type: "fixed" as const,
          value: 0,
          amount: 0
        }
      })),
      paymentInfo: "cash-on",
      status: orderStatus,
      totalAmount: calculateTotal(),
      customerType: "guest",
      adminNotes: "Quick walk-in order"
    };

    try {
      await createQuickOrder(orderData).unwrap();
      toast.success("Quick order created successfully!");
      
      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setOrderStatus("pending");
      setSelectedItems([]);
      setSearchTerm("");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create order");
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setOrderStatus("pending");
    setSelectedItems([]);
    setSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Quick Order - Walk-in Customer
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Customer Info & Products */}
          <div className="space-y-4">
            {/* Customer Info */}
            <div className="space-y-3">
              <h3 className="font-medium">Customer Information</h3>
              <div>
                <Label>Customer Name *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Product Search */}
            <div className="space-y-3">
              <h3 className="font-medium">Add Products</h3>
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {availableProducts.map(product => (
                  <div key={product._id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.description.name}</p>
                      <p className="text-sm text-gray-600">৳{product.productInfo.salePrice || product.productInfo.price}</p>
                      <p className="text-xs text-gray-500">Stock: {product.productInfo.quantity}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addProduct(product)}
                      disabled={selectedItems.some(item => item.productId === product._id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Selected Items & Summary */}
          <div className="space-y-4">
            <h3 className="font-medium">Selected Items ({selectedItems.length})</h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedItems.map(item => {
                const product = products?.find(p => p._id === item.productId);
                return (
                  <div key={item.productId} className="border rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{product?.description.name}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeProduct(item.productId)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">৳{item.price} × {item.quantity}</p>
                        <p className="font-medium">৳{item.price * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="mb-4">
                <Label>Order Status</Label>
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
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-xl font-bold">৳{calculateTotal()}</span>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={handleCreateOrder}
                  disabled={isLoading || selectedItems.length === 0}
                  className="w-full"
                >
                  {isLoading ? "Creating..." : "Create Quick Order"}
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetForm} className="flex-1">
                    Reset
                  </Button>
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickOrderModal;