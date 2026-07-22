export type ApiResponse<T> = {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
};

export type PaginatedResponse<T> = {
  data: T[];
  nextCursor?: string;
  total?: number;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  organizationId: string | null;
};
