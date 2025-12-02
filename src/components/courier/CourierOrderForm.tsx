"use client"
import React from 'react';

type CourierProvider = 'steadfast' | 'pathao';

interface OrderFormData {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  item_description: string;
  store_id: number;
  item_weight: string;
  item_quantity: number;
}

interface CourierOrderFormProps {
  courier: CourierProvider;
  formData: OrderFormData;
  onChange: (data: Partial<OrderFormData>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function CourierOrderForm({ courier, formData, onChange, onSubmit, isLoading }: CourierOrderFormProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Create Order with {courier === 'steadfast' ? 'Steadfast' : 'Pathao'}
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice/Order ID *</label>
            <input
              type="text"
              placeholder="INV-001"
              value={formData.invoice}
              onChange={(e) => onChange({ invoice: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name *</label>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.recipient_name}
              onChange={(e) => onChange({ recipient_name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="text"
              placeholder="01712345678"
              value={formData.recipient_phone}
              onChange={(e) => {
                let phone = e.target.value.replace(/\D/g, '');
                if (phone.startsWith('88')) phone = phone.substring(2);
                if (phone.length > 0 && !phone.startsWith('0')) phone = '0' + phone;
                onChange({ recipient_phone: phone });
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">COD Amount *</label>
            <input
              type="number"
              placeholder="1000"
              value={formData.cod_amount}
              onChange={(e) => onChange({ cod_amount: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Pathao Specific Fields */}
          {courier === 'pathao' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store ID *</label>
                <input
                  type="number"
                  placeholder="123"
                  value={formData.store_id}
                  onChange={(e) => onChange({ store_id: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Get this from Pathao dashboard</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Weight (kg) *</label>
                <input
                  type="text"
                  placeholder="0.5"
                  value={formData.item_weight}
                  onChange={(e) => onChange({ item_weight: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Min: 0.5 kg, Max: 10 kg</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Quantity *</label>
                <input
                  type="number"
                  placeholder="1"
                  value={formData.item_quantity}
                  onChange={(e) => onChange({ item_quantity: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address *</label>
          <textarea
            placeholder="House 123, Road 456, Dhaka"
            value={formData.recipient_address}
            onChange={(e) => onChange({ recipient_address: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Description</label>
          <textarea
            placeholder="T-shirt - Size M - Blue color"
            value={formData.item_description}
            onChange={(e) => onChange({ item_description: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading}
          className={`w-full md:w-auto px-8 py-3 rounded-lg text-white font-medium transition-colors ${
            courier === 'steadfast'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-green-600 hover:bg-green-700'
          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Order...
            </span>
          ) : (
            `Create Order with ${courier === 'steadfast' ? 'Steadfast' : 'Pathao'}`
          )}
        </button>
      </div>
    </div>
  );
}
