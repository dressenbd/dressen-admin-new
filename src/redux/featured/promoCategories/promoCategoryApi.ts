/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from '@/redux/api/baseApi';

export interface IPromoCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const promoCategoryApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getAllPromoCategories: builder.query<IPromoCategory[], void>({
      query: () => ({
        url: '/promo-category',
        method: 'GET',
      }),
      transformResponse: (response: { data: IPromoCategory[] }) => response.data,
    }),
    getActivePromoCategories: builder.query<IPromoCategory[], void>({
      query: () => ({
        url: '/promo-category/active',
        method: 'GET',
      }),
      transformResponse: (response: { data: IPromoCategory[] }) => response.data,
    }),
    getSinglePromoCategory: builder.query<IPromoCategory, string>({
      query: id => ({
        url: `/promo-category/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: { data: IPromoCategory }) => response.data,
    }),
    createPromoCategory: builder.mutation<IPromoCategory, FormData>({
      query: formData => ({
        url: '/promo-category',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: { data: IPromoCategory }) => response.data,
    }),
    updatePromoCategory: builder.mutation<IPromoCategory, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/promo-category/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      transformResponse: (response: { data: IPromoCategory }) => response.data,
    }),
    deletePromoCategory: builder.mutation<{ message: string }, string>({
      query: id => ({
        url: `/promo-category/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetAllPromoCategoriesQuery,
  useGetActivePromoCategoriesQuery,
  useGetSinglePromoCategoryQuery,
  useCreatePromoCategoryMutation,
  useUpdatePromoCategoryMutation,
  useDeletePromoCategoryMutation,
} = promoCategoryApi;
