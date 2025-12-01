'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Edit } from 'lucide-react';
import { useGetPromoProductsQuery } from '@/redux/featured/products/productsApi';
import Link from 'next/link';
import Image from 'next/image';

export default function PromoProductManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: promoProducts, isLoading, refetch } = useGetPromoProductsQuery();

  const filteredProducts = promoProducts?.filter(product =>
    product?.description?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product?.brandAndCategories?.promoCategories?.some(promo => 
      promo.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const calculateDiscount = (price: number, salePrice?: number) => {
    if (!salePrice || salePrice >= price) return 0;
    return Math.round(((price - salePrice) / price) * 100);
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Promo Product Management</h1>
          <p className="text-gray-600">Products with promotional categories assigned</p>
        </div>
        <Button onClick={() => refetch()}>Refresh</Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search promo products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">Promotional Products</h2>
              <p className="text-gray-600 text-sm">Products that have promotional categories assigned</p>
            </div>
            <div className="text-sm text-gray-500">
              Total: {filteredProducts.length} products
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Image</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Product Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Promo Categories</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Sale Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Discount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10">Loading...</td></tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const discount = calculateDiscount(product.productInfo.price, product.productInfo.salePrice);
                  return (
                    <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Image 
                          src={product.featuredImg || '/placeholder.jpg'} 
                          alt={product.description.name} 
                          width={50} 
                          height={50} 
                          className="rounded object-cover" 
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{product.description.name}</p>
                          <p className="text-sm text-gray-500">{product.description.slug}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {product.brandAndCategories.promoCategories?.map((promo) => (
                            <span key={promo._id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {promo.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">৳{product.productInfo.price}</td>
                      <td className="py-4 px-4">
                        {product.productInfo.salePrice ? (
                          <span className="font-medium text-green-600">৳{product.productInfo.salePrice}</span>
                        ) : (
                          <span className="text-gray-400">No sale price</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {discount > 0 ? (
                          <span className="text-red-600 font-medium">{discount}%</span>
                        ) : (
                          <span className="text-gray-400">0%</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.productInfo.quantity > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.productInfo.quantity > 0 ? `${product.productInfo.quantity} in stock` : 'Out of stock'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Link href={`/admin/edit-product/${product._id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={8} className="text-center py-10 text-gray-500">No promotional products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}