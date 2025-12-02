"use client"
import React from 'react';

type CourierProvider = 'steadfast' | 'pathao';

interface CourierSelectorProps {
  selected: CourierProvider;
  onSelect: (courier: CourierProvider) => void;
  steadfastBalance?: { current_balance: number; currency: string };
}

export default function CourierSelector({ selected, onSelect, steadfastBalance }: CourierSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Select Courier Provider</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('steadfast')}
          className={`py-6 px-6 rounded-lg border-2 transition-all text-left ${
            selected === 'steadfast'
              ? 'border-blue-600 bg-blue-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300 hover:shadow'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl mb-2">🚚</div>
              <div className="text-lg font-bold text-gray-800">Steadfast Courier</div>
              <div className="text-sm text-gray-500 mt-1">Reliable nationwide delivery</div>
              {steadfastBalance && (
                <div className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded inline-block text-sm font-medium">
                  Balance: {steadfastBalance.current_balance} {steadfastBalance.currency}
                </div>
              )}
            </div>
            {selected === 'steadfast' && (
              <div className="text-blue-600 text-2xl">✓</div>
            )}
          </div>
        </button>
        
        <button
          onClick={() => onSelect('pathao')}
          className={`py-6 px-6 rounded-lg border-2 transition-all text-left ${
            selected === 'pathao'
              ? 'border-green-600 bg-green-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300 hover:shadow'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl mb-2">📦</div>
              <div className="text-lg font-bold text-gray-800">Pathao Courier</div>
              <div className="text-sm text-gray-500 mt-1">Fast & efficient delivery</div>
              <div className="mt-3 px-3 py-1 bg-green-100 text-green-700 rounded inline-block text-sm font-medium">
                Normal & On-Demand
              </div>
            </div>
            {selected === 'pathao' && (
              <div className="text-green-600 text-2xl">✓</div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
