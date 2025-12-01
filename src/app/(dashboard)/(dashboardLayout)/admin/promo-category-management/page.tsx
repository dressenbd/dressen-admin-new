'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2 } from 'lucide-react';
import { useGetAllPromoCategoriesQuery, useDeletePromoCategoryMutation } from '@/redux/featured/promoCategories/promoCategoryApi';
import PromoCategory from '@/components/promoCategory/PromoCategory';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function PromoCategoryManagement() {
  const { data: promoCategories, isLoading, refetch } = useGetAllPromoCategoriesQuery();
  const [deletePromoCategory] = useDeletePromoCategoryMutation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = promoCategories?.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo category?')) return;
    
    const deleteToast = toast.loading('Deleting...');
    try {
      await deletePromoCategory(id).unwrap();
      toast.success('Promo category deleted!', { id: deleteToast });
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete', { id: deleteToast });
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex justify-end">
        <PromoCategory refetch={refetch}>+ Add Promo Category</PromoCategory>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search promo categories..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Promo Category Management</h2>
          <p className="text-gray-600 text-sm">Manage promotional categories for offers and deals</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Image</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10">Loading...</td></tr>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <Image src={category.image} alt={category.name} width={50} height={50} className="rounded" />
                    </td>
                    <td className="py-4 px-4 font-medium">{category.name}</td>
                    <td className="py-4 px-4 text-gray-600 max-w-xs truncate">{category.description}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <PromoCategory type="edit" editPromoCategory={category} refetch={refetch}>Edit</PromoCategory>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(category._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">No promo categories found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
