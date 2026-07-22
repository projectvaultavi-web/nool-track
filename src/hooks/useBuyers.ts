import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Buyer } from '@prisma/client';
import { BuyerInput } from '@/validations/buyer';

interface FetchBuyersParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useBuyers(params?: FetchBuyersParams) {
  return useQuery<PaginatedResponse<Buyer>>({
    queryKey: ['buyers', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());

      const res = await fetch(`/api/buyers?${searchParams.toString()}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch buyers');
      }
      return res.json();
    },
  });
}

export function useBuyer(id: string) {
  return useQuery<Buyer>({
    queryKey: ['buyers', id],
    queryFn: async () => {
      const res = await fetch(`/api/buyers/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch buyer');
      }
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateBuyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BuyerInput) => {
      const res = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create buyer');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
    },
  });
}

export function useUpdateBuyer(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BuyerInput) => {
      const res = await fetch(`/api/buyers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update buyer');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
      queryClient.invalidateQueries({ queryKey: ['buyers', id] });
    },
  });
}

export function useDeleteBuyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/buyers/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete buyer');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
    },
  });
}
