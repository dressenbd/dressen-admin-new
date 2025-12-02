// ==========================
// PATHAO API
// ==========================

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/redux/store";

const pathaoBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:5000/api/v1',
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `${token}`);
    }
    return headers;
  },
});

// ==========================
// TYPES
// ==========================
export interface IPathaoStore {
  name: string;
  contact_name: string;
  contact_number: string;
  secondary_contact?: string;
  address: string;
  city_id: number;
  zone_id: number;
  area_id: number;
}

export interface IPathaoOrder {
  store_id: number;
  merchant_order_id?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  delivery_type: 48 | 12; // 48=Normal, 12=On Demand
  item_type: 1 | 2; // 1=Document, 2=Parcel
  special_instruction?: string;
  item_quantity: number;
  item_weight: string;
  item_description?: string;
  amount_to_collect: number;
}

export interface IPathaoOrderResponse {
  message: string;
  type: string;
  code: number;
  data: {
    consignment_id: string;
    merchant_order_id: string;
    order_status: string;
    delivery_fee: number;
  };
}

export interface IPathaoBulkOrderResponse {
  message: string;
  type: string;
  code: number;
  data: boolean;
}

export interface IPathaoTracking {
  consignment_id: string;
  merchant_order_id: string;
  order_status: string;
  order_status_slug: string;
  updated_at: string;
  invoice_id: string | null;
}

export interface IPathaoCity {
  city_id: number;
  city_name: string;
}

export interface IPathaoZone {
  zone_id: number;
  zone_name: string;
}

export interface IPathaoArea {
  area_id: number;
  area_name: string;
  home_delivery_available: boolean;
  pickup_available: boolean;
}

export interface IPathaoStoreList {
  store_id: number;
  store_name: string;
  store_address: string;
  is_active: number;
  city_id: number;
  zone_id: number;
}

// ==========================
// RTK QUERY
// ==========================
export const pathaoApi = createApi({
  reducerPath: "pathaoApi",
  baseQuery: pathaoBaseQuery,
  tagTypes: [],
  endpoints: (builder) => ({
    // 🔑 Issue Token
    issueToken: builder.mutation<any, void>({
      query: () => ({
        url: "/pathao/issue-token",
        method: "POST",
      }),
    }),

    // 🏪 Create Store
    createStore: builder.mutation<any, IPathaoStore>({
      query: (storeData) => ({
        url: "/pathao/create-store",
        method: "POST",
        body: { storeData },
      }),
    }),

    // 📦 Create Order
    createOrder: builder.mutation<IPathaoOrderResponse, IPathaoOrder>({
      query: (orderData) => ({
        url: "/pathao/create-order",
        method: "POST",
        body: { orderData },
      }),
    }),

    // 📦 Bulk Create Orders
    bulkCreateOrders: builder.mutation<IPathaoBulkOrderResponse, IPathaoOrder[]>({
      query: (orders) => ({
        url: "/pathao/bulk-order",
        method: "POST",
        body: { orders },
      }),
    }),

    // 📍 Get Order Info (Tracking)
    getOrderInfo: builder.query<IPathaoTracking, string>({
      query: (consignmentId) => `/pathao/order-info/${consignmentId}`,
    }),

    // 🏙️ Get Cities
    getCities: builder.query<IPathaoCity[], void>({
      query: () => '/pathao/cities',
    }),

    // 🗺️ Get Zones
    getZones: builder.query<IPathaoZone[], number>({
      query: (cityId) => `/pathao/cities/${cityId}/zones`,
    }),

    // 📍 Get Areas
    getAreas: builder.query<IPathaoArea[], number>({
      query: (zoneId) => `/pathao/zones/${zoneId}/areas`,
    }),

    // 🏪 Get Stores
    getStores: builder.query<IPathaoStoreList[], void>({
      query: () => '/pathao/stores',
      transformResponse: (response: any) => {
        return response?.data?.data?.data || response?.data?.data || response?.data || response || [];
      },
    }),
  }),
});

// ==========================
// EXPORT HOOKS
// ==========================
export const {
  useIssueTokenMutation,
  useCreateStoreMutation,
  useCreateOrderMutation,
  useBulkCreateOrdersMutation,
  useGetOrderInfoQuery,
  useLazyGetOrderInfoQuery,
  useGetCitiesQuery,
  useLazyGetCitiesQuery,
  useGetZonesQuery,
  useLazyGetZonesQuery,
  useGetAreasQuery,
  useLazyGetAreasQuery,
  useGetStoresQuery,
  useLazyGetStoresQuery,
} = pathaoApi;
