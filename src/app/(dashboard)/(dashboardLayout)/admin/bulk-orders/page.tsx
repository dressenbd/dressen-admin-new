"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { Upload, Download, ShoppingCart, FileText, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useCreateBulkAdminOrdersMutation } from "@/redux/featured/order/orderApi";
import { AdminOrderPayload } from "@/types/Order";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/featured/auth/authSlice";
import { useSession } from "next-auth/react";

const BulkOrdersPage = () => {
  const [createBulkOrders, { isLoading }] = useCreateBulkAdminOrdersMutation();
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: session } = useSession();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [orders, setOrders] = useState<AdminOrderPayload[]>([]);
  const [validationResults, setValidationResults] = useState<{
    valid: AdminOrderPayload[];
    invalid: { order: any; errors: string[] }[];
  }>({ valid: [], invalid: [] });

  const downloadTemplate = () => {
    const csvContent = `orderSource,customerName,customerPhone,customerAddress,customerEmail,customerCity,productId,quantity,paymentMethod,customerType,adminNotes
phone,John Doe,01712345678,123 Main St Dhaka,john@example.com,Dhaka,PRODUCT_ID_HERE,2,cash-on,new,Sample order
walk-in,Jane Smith,01798765432,456 Oak Ave Chittagong,jane@example.com,Chittagong,PRODUCT_ID_HERE,1,card,existing,Walk-in customer`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_orders_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast.error('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      parseCSV(csv);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const parsedOrders: AdminOrderPayload[] = [];
    const errors: { order: any; errors: string[] }[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const orderData: any = {};
      
      headers.forEach((header, index) => {
        orderData[header] = values[index] || '';
      });

      const validationErrors = validateOrderData(orderData);
      
      if (validationErrors.length === 0) {
        const order: AdminOrderPayload = {
          orderSource: orderData.orderSource as any,
          customerInfo: {
            fullName: orderData.customerName,
            phone: orderData.customerPhone,
            address: orderData.customerAddress,
            email: orderData.customerEmail,
            city: orderData.customerCity,
            country: 'Bangladesh'
          },
          orderInfo: [{
            productInfo: orderData.productId,
            quantity: parseInt(orderData.quantity) || 1,
            totalAmount: {
              subTotal: 0, // Will be calculated on backend
              discount: 0,
              total: 0,
            },
            commission: {
              type: 'fixed',
              value: 0,
              amount: 0
            }
          }],
          paymentInfo: orderData.paymentMethod === 'cash-on' ? 'cash-on' : { cardNumber: '', nameOnCard: '' },
          status: orderData.orderSource === 'walk-in' ? 'paid' : 'pending',
          totalAmount: 0, // Will be calculated on backend
          customerType: orderData.customerType as any,
          adminNotes: orderData.adminNotes
        };
        
        parsedOrders.push(order);
      } else {
        errors.push({ order: orderData, errors: validationErrors });
      }
    }

    setValidationResults({ valid: parsedOrders, invalid: errors });
    setOrders(parsedOrders);
  };

  const validateOrderData = (data: any): string[] => {
    const errors: string[] = [];
    
    if (!data.orderSource || !['phone', 'walk-in', 'online', 'whatsapp', 'facebook'].includes(data.orderSource)) {
      errors.push('Invalid order source');
    }
    
    if (!data.customerName) errors.push('Customer name is required');
    if (!data.customerPhone) errors.push('Customer phone is required');
    if (!data.customerAddress) errors.push('Customer address is required');
    if (!data.productId) errors.push('Product ID is required');
    if (!data.quantity || isNaN(parseInt(data.quantity))) errors.push('Valid quantity is required');
    if (!data.paymentMethod) errors.push('Payment method is required');
    
    return errors;
  };

  const handleBulkCreate = async () => {
    const userId = (session?.user as any)?._id || currentUser?._id;
    
    if (!userId || userId === "admin-temp") {
      toast.error('Please login with a valid account to create orders');
      return;
    }
    if (orders.length === 0) {
      toast.error('No valid orders to create');
      return;
    }

    const ordersWithUser = orders.map(order => ({
      ...order,
      orderBy: userId,
      userRole: (session?.user as any)?.role || currentUser?.role || "admin"
    }));

    try {
      await createBulkOrders({ orders: ordersWithUser }).unwrap();
      toast.success(`Successfully created ${orders.length} orders!`);
      
      // Reset form
      setCsvFile(null);
      setOrders([]);
      setValidationResults({ valid: [], invalid: [] });
      
      // Clear file input
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create bulk orders');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Order Creation</h1>
          <p className="text-gray-600">Upload CSV file to create multiple orders at once</p>
        </div>
        <Button onClick={downloadTemplate} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Select CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mt-1"
              />
            </div>
            
            {csvFile && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  File uploaded: {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">CSV Format Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>orderSource: phone, walk-in, online, whatsapp, facebook</li>
                <li>customerName: Full customer name</li>
                <li>customerPhone: Valid phone number</li>
                <li>customerAddress: Complete address</li>
                <li>productId: Valid product ID from system</li>
                <li>quantity: Number of items</li>
                <li>paymentMethod: cash-on, card, mobile-banking</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Validation Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationResults.valid.length > 0 || validationResults.invalid.length > 0 ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Valid: {validationResults.valid.length}
                  </Badge>
                  <Badge variant="destructive">
                    Invalid: {validationResults.invalid.length}
                  </Badge>
                </div>

                {validationResults.invalid.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Invalid Orders:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {validationResults.invalid.map((item, index) => (
                        <div key={index} className="text-sm bg-red-50 p-2 rounded">
                          <p className="font-medium">Row {index + 2}: {item.order.customerName || 'Unknown'}</p>
                          <ul className="list-disc list-inside text-red-600">
                            {item.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validationResults.valid.length > 0 && (
                  <Button 
                    onClick={handleBulkCreate} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isLoading ? 'Creating Orders...' : `Create ${validationResults.valid.length} Orders`}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Upload a CSV file to see validation results
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Preview ({orders.length} orders)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <div className="grid gap-4">
                {orders.slice(0, 5).map((order, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{order.customerInfo.fullName}</h4>
                        <p className="text-sm text-gray-600">{order.customerInfo.phone}</p>
                      </div>
                      <Badge variant="outline">{order.orderSource}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{order.customerInfo.address}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="secondary">{order.customerType}</Badge>
                      <Badge variant="outline">{typeof order.paymentInfo === 'string' ? order.paymentInfo : 'card'}</Badge>
                    </div>
                  </div>
                ))}
                {orders.length > 5 && (
                  <p className="text-center text-gray-500 py-2">
                    ... and {orders.length - 5} more orders
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkOrdersPage;