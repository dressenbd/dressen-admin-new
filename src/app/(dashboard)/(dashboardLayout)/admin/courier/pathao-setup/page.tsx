"use client"
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  useCreateStoreMutation,
  useGetStoresQuery,
  useLazyGetCitiesQuery,
  useLazyGetZonesQuery,
  useLazyGetAreasQuery,
} from "@/redux/featured/courier/pathaoApi";

export default function PathaoSetup() {
  const [createStore, { isLoading }] = useCreateStoreMutation();
  const { data: stores, refetch } = useGetStoresQuery();
  const [getCities] = useLazyGetCitiesQuery();
  const [getZones] = useLazyGetZonesQuery();
  const [getAreas] = useLazyGetAreasQuery();

  const [cities, setCities] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '',
    contact_name: '',
    contact_number: '',
    secondary_contact: '',
    address: '',
    city_id: 0,
    zone_id: 0,
    area_id: 0,
  });

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const result = await getCities().unwrap();
      setCities((result as any)?.data || result || []);
    } catch (err) {
      toast.error('Failed to load cities');
    }
  };

  const loadZones = async (cityId: number) => {
    try {
      const result = await getZones(cityId).unwrap();
      setZones((result as any)?.data || result || []);
      setAreas([]);
    } catch (err) {
      toast.error('Failed to load zones');
    }
  };

  const loadAreas = async (zoneId: number) => {
    try {
      const result = await getAreas(zoneId).unwrap();
      setAreas((result as any)?.data || result || []);
    } catch (err) {
      toast.error('Failed to load areas');
    }
  };

  const handleSubmit = async () => {
    try {
      await createStore(form).unwrap();
      toast.success('Store created! Wait 1 hour for approval');
      setForm({ name: '', contact_name: '', contact_number: '', secondary_contact: '', address: '', city_id: 0, zone_id: 0, area_id: 0 });
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Pathao Store Setup</h1>

        {/* Existing Stores */}
        {stores && stores.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Stores</h2>
            {stores.map((store: any) => (
              <div key={store.store_id} className="p-4 border rounded mb-2">
                <p><strong>Store ID:</strong> {store.store_id}</p>
                <p><strong>Name:</strong> {store.store_name}</p>
                <p><strong>Status:</strong> {store.is_active ? '✅ Active' : '⏳ Pending'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Create Store Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Store</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store Name * (3-50 chars)</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name * (3-50 chars)</label>
                <input type="text" value={form.contact_name} onChange={(e) => setForm({...form, contact_name: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Number * (11 digits)</label>
                <input type="text" placeholder="01712345678" value={form.contact_number} onChange={(e) => setForm({...form, contact_number: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Secondary Contact (11 digits)</label>
                <input type="text" placeholder="01712345678" value={form.secondary_contact} onChange={(e) => setForm({...form, secondary_contact: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <select value={form.city_id} onChange={(e) => { const id = Number(e.target.value); setForm({...form, city_id: id, zone_id: 0, area_id: 0}); loadZones(id); }} className="w-full border rounded px-3 py-2">
                  <option value={0}>Select City</option>
                  {Array.isArray(cities) && cities.map((city: any) => <option key={city.city_id} value={city.city_id}>{city.city_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Zone *</label>
                <select value={form.zone_id} onChange={(e) => { const id = Number(e.target.value); setForm({...form, zone_id: id, area_id: 0}); loadAreas(id); }} className="w-full border rounded px-3 py-2" disabled={!form.city_id}>
                  <option value={0}>Select Zone</option>
                  {Array.isArray(zones) && zones.map((zone: any) => <option key={zone.zone_id} value={zone.zone_id}>{zone.zone_name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Area *</label>
                <select value={form.area_id} onChange={(e) => setForm({...form, area_id: Number(e.target.value)})} className="w-full border rounded px-3 py-2" disabled={!form.zone_id}>
                  <option value={0}>Select Area</option>
                  {Array.isArray(areas) && areas.map((area: any) => <option key={area.area_id} value={area.area_id}>{area.area_name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store Address * (15-120 chars)</label>
              <textarea value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full border rounded px-3 py-2" rows={3} placeholder="House 123, Road 4, Sector 10, Uttara, Dhaka-1230" />
            </div>
            <button onClick={handleSubmit} disabled={isLoading} className="bg-green-600 text-white px-6 py-2 rounded">{isLoading ? 'Creating...' : 'Create Store'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
