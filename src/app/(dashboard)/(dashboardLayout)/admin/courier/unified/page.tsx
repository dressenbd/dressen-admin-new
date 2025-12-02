"use client"
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetBalanceQuery,
  useCreateOrderMutation as useSteadfastCreateOrder,
  useBulkCreateOrdersMutation as useSteadfastBulk,
  useLazyGetStatusByInvoiceQuery,
  useCreateReturnRequestMutation,
  useGetReturnRequestsQuery,
} from "@/redux/featured/courier/steadfastApi";
import {
  useCreateOrderMutation as usePathaoCreateOrder,
  useBulkCreateOrdersMutation as usePathaoBulk,
  useLazyGetOrderInfoQuery,
  useCreateStoreMutation,
  useGetStoresQuery,
  useLazyGetCitiesQuery,
  useLazyGetZonesQuery,
  useLazyGetAreasQuery,
  useIssueTokenMutation,
} from "@/redux/featured/courier/pathaoApi";

type CourierProvider = 'steadfast' | 'pathao';

export default function UnifiedCourierDashboard() {
  const [selectedCourier, setSelectedCourier] = useState<CourierProvider>('steadfast');
  const [activeTab, setActiveTab] = useState('order');

  // Steadfast
  const { data: balance, refetch: refetchBalance } = useGetBalanceQuery();
  const [createSteadfastOrder, { isLoading: steadfastOrderLoading }] = useSteadfastCreateOrder();
  const [bulkSteadfast, { isLoading: steadfastBulkLoading }] = useSteadfastBulk();
  const [getStatusByInvoice] = useLazyGetStatusByInvoiceQuery();
  const [createReturn, { isLoading: returnLoading }] = useCreateReturnRequestMutation();
  const { data: allReturns, refetch: refetchReturns } = useGetReturnRequestsQuery();

  // Pathao
  const [createPathaoOrder, { isLoading: pathaoOrderLoading }] = usePathaoCreateOrder();
  const [bulkPathao, { isLoading: pathaoBulkLoading }] = usePathaoBulk();
  const [getPathaoOrderInfo] = useLazyGetOrderInfoQuery();
  const [createStore, { isLoading: storeLoading }] = useCreateStoreMutation();
  const { data: stores, refetch: refetchStores } = useGetStoresQuery();
  const [getCities] = useLazyGetCitiesQuery();
  const [getZones] = useLazyGetZonesQuery();
  const [getAreas] = useLazyGetAreasQuery();
  const [issueToken] = useIssueTokenMutation();

  // Steadfast Order Form
  const [steadfastForm, setSteadfastForm] = useState({
    invoice: '',
    recipient_name: '',
    recipient_phone: '',
    recipient_address: '',
    cod_amount: 0,
    item_description: '',
    total_lot: 1
  });

  // Pathao Order Form
  const [pathaoForm, setPathaoForm] = useState({
    store_id: 0,
    merchant_order_id: '',
    recipient_name: '',
    recipient_phone: '',
    recipient_address: '',
    delivery_type: 48,
    item_type: 2,
    special_instruction: '',
    item_quantity: 1,
    item_weight: '0.5',
    item_description: '',
    amount_to_collect: 0
  });

  // Bulk Orders
  const [steadfastBulkOrders, setSteadfastBulkOrders] = useState([{
    invoice: '', recipient_name: '', recipient_phone: '', recipient_address: '', cod_amount: 0, item_description: '', total_lot: 1
  }]);

  const [pathaoBulkOrders, setPathaoBulkOrders] = useState([{
    store_id: 0, merchant_order_id: '', recipient_name: '', recipient_phone: '', recipient_address: '',
    delivery_type: 48, item_type: 2, item_quantity: 1, item_weight: '0.5', amount_to_collect: 0,
    special_instruction: '', item_description: ''
  }]);

  // Tracking
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingType, setTrackingType] = useState('invoice');

  // Returns
  const [returnForm, setReturnForm] = useState({ consignment_id: '', invoice: '', tracking_code: '', reason: '' });

  // Store Setup
  const [cities, setCities] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [storeForm, setStoreForm] = useState({
    name: '', contact_name: '', contact_number: '', secondary_contact: '', address: '', city_id: 0, zone_id: 0, area_id: 0
  });

  // Results
  const [orderResult, setOrderResult] = useState<any>(null);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [returnResult, setReturnResult] = useState<any>(null);

  const handleCreateOrder = async () => {
    try {
      if (selectedCourier === 'steadfast') {
        const result = await createSteadfastOrder(steadfastForm).unwrap();
        const trackingCode = (result as any).data?.consignment?.tracking_code || (result as any).consignment?.tracking_code || 'N/A';
        setOrderResult({ success: true, data: result });
        toast.success(`Order created! Tracking: ${trackingCode}`);
        setSteadfastForm({ invoice: '', recipient_name: '', recipient_phone: '', recipient_address: '', cod_amount: 0, item_description: '', total_lot: 1 });
      } else {
        await issueToken().unwrap();
        const result = await createPathaoOrder(pathaoForm as any).unwrap();
        setOrderResult({ success: true, data: result });
        const consignmentId = (result as any)?.consignment_id || 'N/A';
        toast.success(`Order created! Consignment: ${consignmentId}`);
        setPathaoForm({ store_id: 0, merchant_order_id: '', recipient_name: '', recipient_phone: '', recipient_address: '', delivery_type: 48, item_type: 2, special_instruction: '', item_quantity: 1, item_weight: '0.5', item_description: '', amount_to_collect: 0 });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed');
    }
  };

  const handleBulkOrder = async () => {
    try {
      if (selectedCourier === 'steadfast') {
        const result = await bulkSteadfast(steadfastBulkOrders).unwrap();
        setBulkResult({ success: true, data: result });
        toast.success('Bulk orders created!');
        setSteadfastBulkOrders([{ invoice: '', recipient_name: '', recipient_phone: '', recipient_address: '', cod_amount: 0, item_description: '', total_lot: 1 }]);
      } else {
        await issueToken().unwrap();
        const result = await bulkPathao(pathaoBulkOrders as any).unwrap();
        setBulkResult({ success: true, data: result });
        toast.success('Bulk orders submitted!');
        setPathaoBulkOrders([{ store_id: 0, merchant_order_id: '', recipient_name: '', recipient_phone: '', recipient_address: '', delivery_type: 48, item_type: 2, item_quantity: 1, item_weight: '0.5', amount_to_collect: 0, special_instruction: '', item_description: '' }]);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed');
    }
  };

  const handleTracking = async () => {
    try {
      if (selectedCourier === 'steadfast') {
        const result = await getStatusByInvoice(trackingInput).unwrap();
        setTrackingResult({ success: true, data: result });
      } else {
        await issueToken().unwrap();
        const result = await getPathaoOrderInfo(trackingInput).unwrap();
        setTrackingResult({ success: true, data: result });
        setTrackingInput('');
      }
    } catch (err: any) {
      toast.error('Tracking failed');
    }
  };

  const handleCreateReturn = async () => {
    try {
      const result = await createReturn(returnForm).unwrap();
      setReturnResult({ success: true, data: result });
      refetchReturns();
      toast.success('Return request created!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed');
    }
  };

  const tabs = [
    ...(selectedCourier === 'steadfast' ? [{ id: 'balance', label: '💰 Balance', disabled: false }] : []),
    ...(selectedCourier === 'pathao' ? [{ id: 'setup', label: '🏪 Store Setup', disabled: false }] : []),
    { id: 'order', label: '📦 Create Order', disabled: false },
    { id: 'bulk', label: '📦 Bulk Orders', disabled: false },
    { id: 'tracking', label: '📍 Tracking', disabled: false },
    ...(selectedCourier === 'steadfast' ? [{ id: 'returns', label: '🔄 Returns', disabled: false }] : []),
  ];

  const loadCities = async () => {
    try {
      await issueToken().unwrap();
      const result = await getCities().unwrap();
      const citiesData = (result as any)?.data?.data?.data || result || [];
      setCities(Array.isArray(citiesData) ? citiesData : []);
    } catch (err: any) {
      console.error('Cities loading error:', err);
      toast.error(err?.data?.message || 'Failed to load cities');
    }
  };

  const loadZones = async (cityId: number) => {
    try {
      await issueToken().unwrap();
      const result = await getZones(cityId).unwrap();
      const zonesData = (result as any)?.data?.data?.data || result || [];
      setZones(Array.isArray(zonesData) ? zonesData : []);
      setAreas([]);
    } catch (err: any) {
      console.error('Zones loading error:', err);
      toast.error(err?.data?.message || 'Failed to load zones');
    }
  };

  const loadAreas = async (zoneId: number) => {
    try {
      await issueToken().unwrap();
      const result = await getAreas(zoneId).unwrap();
      const areasData = (result as any)?.data?.data?.data || result || [];
      setAreas(Array.isArray(areasData) ? areasData : []);
    } catch (err: any) {
      console.error('Areas loading error:', err);
      toast.error(err?.data?.message || 'Failed to load areas');
    }
  };

  const handleCreateStore = async () => {
    try {
      await issueToken().unwrap();
      console.log('Store form data:', storeForm);
      await createStore(storeForm).unwrap();
      toast.success('Store created! Wait 1 hour for approval');
      setStoreForm({ name: '', contact_name: '', contact_number: '', secondary_contact: '', address: '', city_id: 0, zone_id: 0, area_id: 0 });
      refetchStores();
    } catch (err: any) {
      console.error('Store creation error:', err);
      toast.error(err?.data?.message || 'Failed to create store');
    }
  };

  React.useEffect(() => {
    if (selectedCourier === 'pathao' && activeTab === 'setup') {
      loadCities();
    }
  }, [selectedCourier, activeTab]);

  React.useEffect(() => {
    if (selectedCourier === 'pathao') {
      refetchStores();
    }
  }, [selectedCourier]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{selectedCourier === 'steadfast' ? 'Steadfast' : 'Pathao'} Courier Management</h1>

        {/* Courier Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4">
            <button onClick={() => setSelectedCourier('steadfast')} className={`flex-1 py-3 px-4 rounded-lg border-2 ${selectedCourier === 'steadfast' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
              <div className="font-semibold">🚚 Steadfast</div>
              {balance && <div className="text-sm text-gray-600">Balance: {balance.current_balance} {balance.currency}</div>}
            </button>
            <button onClick={() => setSelectedCourier('pathao')} className={`flex-1 py-3 px-4 rounded-lg border-2 ${selectedCourier === 'pathao' ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
              <div className="font-semibold">📦 Pathao</div>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => !tab.disabled && setActiveTab(tab.id)} disabled={tab.disabled}
              className={`px-4 py-2 font-medium ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'} ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Balance Tab */}
        {activeTab === 'balance' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Check Balance</h2>
            <button onClick={() => refetchBalance()} className="bg-blue-600 text-white px-4 py-2 rounded">Refresh Balance</button>
            {balance && <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded"><strong>Balance:</strong> {balance.current_balance} {balance.currency}</div>}
          </div>
        )}

        {/* Store Setup Tab */}
        {activeTab === 'setup' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pathao Store Setup</h2>
            
            {/* Existing Stores */}
            {Array.isArray(stores) && stores.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Your Stores</h3>
                {stores.map((store: any) => (
                  <div key={store.store_id} className="p-4 border rounded mb-2 bg-gray-50">
                    <p><strong>Store ID:</strong> {store.store_id}</p>
                    <p><strong>Name:</strong> {store.store_name}</p>
                    <p><strong>Status:</strong> {store.is_active ? '✅ Active' : '⏳ Pending'}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Create Store Form */}
            <div>
              <h3 className="text-lg font-medium mb-3">Create New Store</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Store Name * (3-50 chars)</label>
                    <input type="text" value={storeForm.name} onChange={(e) => setStoreForm({...storeForm, name: e.target.value})} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Name * (3-50 chars)</label>
                    <input type="text" value={storeForm.contact_name} onChange={(e) => setStoreForm({...storeForm, contact_name: e.target.value})} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Number * (11 digits)</label>
                    <input type="text" placeholder="01712345678" value={storeForm.contact_number} onChange={(e) => setStoreForm({...storeForm, contact_number: e.target.value})} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Secondary Contact (11 digits)</label>
                    <input type="text" placeholder="01712345678" value={storeForm.secondary_contact} onChange={(e) => setStoreForm({...storeForm, secondary_contact: e.target.value})} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <select value={storeForm.city_id} onChange={(e) => { const id = Number(e.target.value); setStoreForm({...storeForm, city_id: id, zone_id: 0, area_id: 0}); if(id > 0) loadZones(id); }} className="w-full border rounded px-3 py-2">
                      <option value={0}>Select City</option>
                      {Array.isArray(cities) && cities.map((city: any) => <option key={city.city_id} value={city.city_id}>{city.city_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Zone *</label>
                    <select value={storeForm.zone_id} onChange={(e) => { const id = Number(e.target.value); setStoreForm({...storeForm, zone_id: id, area_id: 0}); loadAreas(id); }} className="w-full border rounded px-3 py-2" disabled={!storeForm.city_id}>
                      <option value={0}>Select Zone</option>
                      {Array.isArray(zones) && zones.map((zone: any) => <option key={zone.zone_id} value={zone.zone_id}>{zone.zone_name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Area *</label>
                    <select value={storeForm.area_id} onChange={(e) => setStoreForm({...storeForm, area_id: Number(e.target.value)})} className="w-full border rounded px-3 py-2" disabled={!storeForm.zone_id}>
                      <option value={0}>Select Area</option>
                      {Array.isArray(areas) && areas.map((area: any) => <option key={area.area_id} value={area.area_id}>{area.area_name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Store Address * (15-120 chars)</label>
                  <textarea value={storeForm.address} onChange={(e) => setStoreForm({...storeForm, address: e.target.value})} className="w-full border rounded px-3 py-2" rows={3} placeholder="House 123, Road 4, Sector 10, Uttara, Dhaka-1230" />
                </div>
                <button onClick={handleCreateStore} disabled={storeLoading} className="bg-green-600 text-white px-6 py-2 rounded">{storeLoading ? 'Creating...' : 'Create Store'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Create Order Tab */}
        {activeTab === 'order' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create Single Order</h2>
            {selectedCourier === 'steadfast' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Invoice Number *</label><input type="text" placeholder="INV-001" value={steadfastForm.invoice} onChange={(e) => setSteadfastForm({...steadfastForm, invoice: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">Recipient Name *</label><input type="text" placeholder="John Doe" value={steadfastForm.recipient_name} onChange={(e) => setSteadfastForm({...steadfastForm, recipient_name: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">Phone Number *</label><input type="text" placeholder="01712345678" value={steadfastForm.recipient_phone} onChange={(e) => setSteadfastForm({...steadfastForm, recipient_phone: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">COD Amount *</label><input type="number" placeholder="1000" value={steadfastForm.cod_amount} onChange={(e) => setSteadfastForm({...steadfastForm, cod_amount: Number(e.target.value)})} className="w-full border rounded px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">Total Lot</label><input type="number" placeholder="1" value={steadfastForm.total_lot} onChange={(e) => setSteadfastForm({...steadfastForm, total_lot: Number(e.target.value)})} className="w-full border rounded px-3 py-2" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Recipient Address *</label><textarea placeholder="House 123, Road 456, Dhaka" value={steadfastForm.recipient_address} onChange={(e) => setSteadfastForm({...steadfastForm, recipient_address: e.target.value})} className="w-full border rounded px-3 py-2" rows={2} /></div>
                <div><label className="block text-sm font-medium mb-1">Item Description</label><textarea placeholder="T-shirt - Size M" value={steadfastForm.item_description} onChange={(e) => setSteadfastForm({...steadfastForm, item_description: e.target.value})} className="w-full border rounded px-3 py-2" rows={2} /></div>
                <button onClick={handleCreateOrder} disabled={steadfastOrderLoading} className="bg-green-600 text-white px-6 py-2 rounded">{steadfastOrderLoading ? 'Creating...' : 'Create Order'}</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Store *</label>
                    <select value={pathaoForm.store_id} onChange={(e) => setPathaoForm({...pathaoForm, store_id: Number(e.target.value)})} className="w-full border rounded px-3 py-2">
                      <option value={0}>Select Store</option>
                      {Array.isArray(stores) && stores.map((store: any) => (
                        <option key={store.store_id} value={store.store_id}>
                          {store.store_name} (ID: {store.store_id}) - {store.is_active ? 'Active' : 'Pending'}
                        </option>
                      ))}
                    </select>
                    {(!Array.isArray(stores) || stores.length === 0) && (
                      <p className="text-sm text-red-600 mt-1">No stores found. Create a store first in Store Setup tab.</p>
                    )}
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Merchant Order ID</label><input type="text" placeholder="ORD-001" value={pathaoForm.merchant_order_id} onChange={(e) => setPathaoForm({...pathaoForm, merchant_order_id: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">Recipient Name *</label><input type="text" placeholder="Demo Recipient" value={pathaoForm.recipient_name} onChange={(e) => setPathaoForm({...pathaoForm, recipient_name: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">Recipient Phone *</label><input type="text" placeholder="017XXXXXXXX" value={pathaoForm.recipient_phone} onChange={(e) => setPathaoForm({...pathaoForm, recipient_phone: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">Item Quantity *</label><input type="number" placeholder="1" value={pathaoForm.item_quantity} onChange={(e) => setPathaoForm({...pathaoForm, item_quantity: Number(e.target.value)})} className="w-full border rounded px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">Item Weight (kg) *</label><input type="text" placeholder="0.5" value={pathaoForm.item_weight} onChange={(e) => setPathaoForm({...pathaoForm, item_weight: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">Amount to Collect *</label><input type="number" placeholder="900" value={pathaoForm.amount_to_collect} onChange={(e) => setPathaoForm({...pathaoForm, amount_to_collect: Number(e.target.value)})} className="w-full border rounded px-3 py-2" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Recipient Address *</label><textarea placeholder="House 123, Road 4, Sector 10, Uttara, Dhaka" value={pathaoForm.recipient_address} onChange={(e) => setPathaoForm({...pathaoForm, recipient_address: e.target.value})} className="w-full border rounded px-3 py-2" rows={2} /></div>
                <div><label className="block text-sm font-medium mb-1">Special Instruction</label><textarea placeholder="Need to Delivery before 5 PM" value={pathaoForm.special_instruction} onChange={(e) => setPathaoForm({...pathaoForm, special_instruction: e.target.value})} className="w-full border rounded px-3 py-2" rows={2} /></div>
                <div><label className="block text-sm font-medium mb-1">Item Description</label><textarea placeholder="Cloth item, price- 3000" value={pathaoForm.item_description} onChange={(e) => setPathaoForm({...pathaoForm, item_description: e.target.value})} className="w-full border rounded px-3 py-2" rows={2} /></div>
                <button onClick={handleCreateOrder} disabled={pathaoOrderLoading} className="bg-green-600 text-white px-6 py-2 rounded">{pathaoOrderLoading ? 'Creating...' : 'Create Order'}</button>
              </div>
            )}
            {orderResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold mb-3 text-green-800">✅ Order Created Successfully</h3>
                {selectedCourier === 'steadfast' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Tracking Code:</span> {orderResult.data?.data?.consignment?.tracking_code || orderResult.data?.consignment?.tracking_code || 'N/A'}</div>
                    <div><span className="font-medium">Consignment ID:</span> {orderResult.data?.data?.consignment?.consignment_id || orderResult.data?.consignment?.consignment_id || 'N/A'}</div>
                    <div><span className="font-medium">Status:</span> {orderResult.data?.data?.consignment?.status || orderResult.data?.consignment?.status || 'Pending'}</div>
                    <div><span className="font-medium">Delivery Fee:</span> ৳{orderResult.data?.data?.consignment?.delivery_fee || orderResult.data?.consignment?.delivery_fee || 0}</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Consignment ID:</span> {orderResult.data?.data?.data?.consignment_id || orderResult.data?.consignment_id || 'N/A'}</div>
                    <div><span className="font-medium">Merchant Order ID:</span> {orderResult.data?.data?.data?.merchant_order_id || orderResult.data?.merchant_order_id || 'N/A'}</div>
                    <div><span className="font-medium">Status:</span> {orderResult.data?.data?.data?.order_status || orderResult.data?.order_status || 'Pending'}</div>
                    <div><span className="font-medium">Delivery Fee:</span> ৳{orderResult.data?.data?.data?.delivery_fee || orderResult.data?.delivery_fee || 0}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bulk Orders Tab */}
        {activeTab === 'bulk' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Bulk Create Orders</h2>
            {selectedCourier === 'steadfast' ? (
              <>
                {steadfastBulkOrders.map((order, i) => (
                  <div key={i} className="mb-4 p-4 border rounded">
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Invoice" value={order.invoice} onChange={(e) => { const n = [...steadfastBulkOrders]; n[i].invoice = e.target.value; setSteadfastBulkOrders(n); }} className="border rounded px-3 py-2" />
                      <input type="text" placeholder="Name" value={order.recipient_name} onChange={(e) => { const n = [...steadfastBulkOrders]; n[i].recipient_name = e.target.value; setSteadfastBulkOrders(n); }} className="border rounded px-3 py-2" />
                      <input type="text" placeholder="Phone" value={order.recipient_phone} onChange={(e) => { const n = [...steadfastBulkOrders]; n[i].recipient_phone = e.target.value; setSteadfastBulkOrders(n); }} className="border rounded px-3 py-2" />
                      <input type="number" placeholder="COD" value={order.cod_amount} onChange={(e) => { const n = [...steadfastBulkOrders]; n[i].cod_amount = Number(e.target.value); setSteadfastBulkOrders(n); }} className="border rounded px-3 py-2" />
                    </div>
                    <textarea placeholder="Address" value={order.recipient_address} onChange={(e) => { const n = [...steadfastBulkOrders]; n[i].recipient_address = e.target.value; setSteadfastBulkOrders(n); }} className="w-full border rounded px-3 py-2 mt-2" rows={2} />
                  </div>
                ))}
                <button onClick={() => setSteadfastBulkOrders([...steadfastBulkOrders, { invoice: '', recipient_name: '', recipient_phone: '', recipient_address: '', cod_amount: 0, item_description: '', total_lot: 1 }])} className="bg-gray-600 text-white px-4 py-2 rounded mr-2">+ Add Order</button>
                <button onClick={handleBulkOrder} disabled={steadfastBulkLoading} className="bg-purple-600 text-white px-6 py-2 rounded">Create Bulk Orders</button>
              </>
            ) : (
              <>
                {pathaoBulkOrders.map((order, i) => (
                  <div key={i} className="mb-4 p-4 border rounded">
                    <h4 className="font-medium mb-3 text-gray-700">Order #{i + 1}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Store *</label>
                        <select value={order.store_id} onChange={(e) => { const n = [...pathaoBulkOrders]; n[i].store_id = Number(e.target.value); setPathaoBulkOrders(n); }} className="w-full border rounded px-3 py-2">
                          <option value={0}>Select Store</option>
                          {Array.isArray(stores) && stores.map((store: any) => (
                            <option key={store.store_id} value={store.store_id}>
                              {store.store_name} (ID: {store.store_id})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Merchant Order ID</label>
                        <input type="text" placeholder="ORD-001" value={order.merchant_order_id} onChange={(e) => { const n = [...pathaoBulkOrders]; n[i].merchant_order_id = e.target.value; setPathaoBulkOrders(n); }} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Recipient Name *</label>
                        <input type="text" placeholder="John Doe" value={order.recipient_name} onChange={(e) => { const n = [...pathaoBulkOrders]; n[i].recipient_name = e.target.value; setPathaoBulkOrders(n); }} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone Number *</label>
                        <input type="text" placeholder="017XXXXXXXX" value={order.recipient_phone} onChange={(e) => { const n = [...pathaoBulkOrders]; n[i].recipient_phone = e.target.value; setPathaoBulkOrders(n); }} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Item Weight (kg) *</label>
                        <input type="text" placeholder="0.5" value={order.item_weight} onChange={(e) => { const n = [...pathaoBulkOrders]; n[i].item_weight = e.target.value; setPathaoBulkOrders(n); }} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Amount to Collect *</label>
                        <input type="number" placeholder="900" value={order.amount_to_collect} onChange={(e) => { const n = [...pathaoBulkOrders]; n[i].amount_to_collect = Number(e.target.value); setPathaoBulkOrders(n); }} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Item Quantity *</label>
                        <input type="number" placeholder="1" value={order.item_quantity} onChange={(e) => { const n = [...pathaoBulkOrders]; n[i].item_quantity = Number(e.target.value); setPathaoBulkOrders(n); }} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Delivery Type *</label>
                        <select value={order.delivery_type} onChange={(e) => { const n = [...pathaoBulkOrders]; n[i].delivery_type = Number(e.target.value); setPathaoBulkOrders(n); }} className="w-full border rounded px-3 py-2">
                          <option value={48}>Normal Delivery (48h)</option>
                          <option value={12}>On Demand (12h)</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Recipient Address *</label>
                        <textarea placeholder="House 123, Road 4, Sector 10, Uttara, Dhaka" value={order.recipient_address} onChange={(e) => { const n = [...pathaoBulkOrders]; n[i].recipient_address = e.target.value; setPathaoBulkOrders(n); }} className="w-full border rounded px-3 py-2" rows={2} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Special Instruction</label>
                        <textarea placeholder="Need to Delivery before 5 PM" value={order.special_instruction} onChange={(e) => { const n = [...pathaoBulkOrders]; n[i].special_instruction = e.target.value; setPathaoBulkOrders(n); }} className="w-full border rounded px-3 py-2" rows={2} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Item Description</label>
                        <textarea placeholder="Cloth item, price- 3000" value={order.item_description} onChange={(e) => { const n = [...pathaoBulkOrders]; n[i].item_description = e.target.value; setPathaoBulkOrders(n); }} className="w-full border rounded px-3 py-2" rows={2} />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setPathaoBulkOrders([...pathaoBulkOrders, { store_id: 0, merchant_order_id: '', recipient_name: '', recipient_phone: '', recipient_address: '', delivery_type: 48, item_type: 2, item_quantity: 1, item_weight: '0.5', amount_to_collect: 0, special_instruction: '', item_description: '' }])} className="bg-gray-600 text-white px-4 py-2 rounded mr-2">+ Add Order</button>
                <button onClick={handleBulkOrder} disabled={pathaoBulkLoading} className="bg-purple-600 text-white px-6 py-2 rounded">Create Bulk Orders</button>
              </>
            )}
            {bulkResult && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-800">📦 Bulk Orders Processed</h3>
                {selectedCourier === 'steadfast' ? (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Total Orders:</span> {bulkResult.data?.data?.length || bulkResult.data?.length || 0}
                    </div>
                    {bulkResult.data?.data?.map((order: any, index: number) => (
                      <div key={index} className="p-2 bg-white rounded border text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div><span className="font-medium">#{index + 1} Tracking:</span> {order.consignment?.tracking_code || 'N/A'}</div>
                          <div><span className="font-medium">Status:</span> {order.consignment?.status || 'Pending'}</div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-sm text-green-600">✅ All orders submitted successfully</div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm">
                    <div className="p-3 bg-white rounded border">
                      <div className="text-green-600 font-medium">✅ {bulkResult.data?.message || 'Bulk order creation request accepted'}</div>
                      <div className="text-gray-600 mt-1">Please wait for order processing to complete. You can track individual orders once they are processed.</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Track Order Status</h2>
            <div className="flex gap-4">
              {selectedCourier === 'steadfast' && (
                <select value={trackingType} onChange={(e) => setTrackingType(e.target.value)} className="border rounded px-3 py-2">
                  <option value="invoice">By Invoice</option>
                  <option value="consignment">By Consignment ID</option>
                  <option value="tracking">By Tracking Code</option>
                </select>
              )}
              <input type="text" placeholder={selectedCourier === 'steadfast' ? `Enter ${trackingType}` : 'Enter Consignment ID'} value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} className="flex-1 border rounded px-3 py-2" />
              <button onClick={handleTracking} className="bg-blue-600 text-white px-6 py-2 rounded">Track</button>
            </div>
            {trackingResult && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                {selectedCourier === 'pathao' ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-blue-800">📦 Order Tracking Details</h3>
                    {(() => {
                      const orderData = trackingResult?.data?.data?.data;
                      if (!orderData) return <p>No tracking data available</p>;
                      return (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Consignment ID:</strong> {orderData.order_consignment_id}</div>
                          <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${orderData.order_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{orderData.order_status}</span></div>
                          <div><strong>Recipient:</strong> {orderData.recipient_name}</div>
                          <div><strong>Phone:</strong> {orderData.recipient_phone}</div>
                          <div><strong>Address:</strong> {orderData.recipient_address}</div>
                          <div><strong>Location:</strong> {orderData.area_name}, {orderData.zone_name}, {orderData.city_name}</div>
                          <div><strong>Order Amount:</strong> ৳{orderData.order_amount}</div>
                          <div><strong>Delivery Fee:</strong> ৳{orderData.delivery_fee}</div>
                          <div><strong>Total Weight:</strong> {orderData.total_weight} kg</div>
                          <div><strong>Item Type:</strong> {orderData.item_type}</div>
                          <div><strong>COD:</strong> {orderData.cash_on_delivery}</div>
                          <div><strong>Store:</strong> {orderData.store_name}</div>
                          <div><strong>Created:</strong> {new Date(orderData.order_created_at).toLocaleString()}</div>
                          <div><strong>Last Updated:</strong> {new Date(orderData.order_status_updated_at).toLocaleString()}</div>
                          {orderData.delivery_instruction && <div className="col-span-2"><strong>Instructions:</strong> {orderData.delivery_instruction}</div>}
                          {orderData.item_description && <div className="col-span-2"><strong>Item Description:</strong> {orderData.item_description}</div>}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <pre className="text-sm overflow-auto">{JSON.stringify(trackingResult, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Returns Tab */}
        {activeTab === 'returns' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create Return Request</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Consignment ID" value={returnForm.consignment_id} onChange={(e) => setReturnForm({...returnForm, consignment_id: e.target.value})} className="w-full border rounded px-3 py-2" />
              <textarea placeholder="Reason" value={returnForm.reason} onChange={(e) => setReturnForm({...returnForm, reason: e.target.value})} className="w-full border rounded px-3 py-2" rows={2} />
              <button onClick={handleCreateReturn} disabled={returnLoading} className="bg-orange-600 text-white px-6 py-2 rounded">Create Return</button>
            </div>
            {returnResult && <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded"><pre className="text-sm overflow-auto">{JSON.stringify(returnResult, null, 2)}</pre></div>}
            {allReturns && allReturns.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">All Returns</h3>
                {allReturns.map((ret, i) => (
                  <div key={i} className="p-3 bg-gray-50 border rounded mb-2">
                    <p><strong>ID:</strong> {ret.id}</p>
                    <p><strong>Status:</strong> {ret.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
