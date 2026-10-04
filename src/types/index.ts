export type Role = 'ADMIN' | 'USER' | 'STORE_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt: string;
  storeName?: string | null;
  storeRating?: number | null;
  storeTotalRatings?: number;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId: string;
  ownerName?: string;
  category?: string;
  phone?: string;
  operatingHours?: string;
  imageUrl?: string;
  isVerified?: boolean;
  overallRating: number;
  totalRatings: number;
  createdAt: string;
}

export interface Rating {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userAddress?: string;
  storeId: string;
  storeName?: string;
  rating: number; // 1 to 5
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  roleBreakdown: {
    admin: number;
    user: number;
    storeOwner: number;
  };
}

export interface StoreOwnerDashboardData {
  store: Store | null;
  overallRating: number;
  totalRatings: number;
  ratingDistribution: { [key: number]: number };
  ratings: Rating[];
}

export interface StoreWithUserRating extends Store {
  userRating: number | null; // null if not rated yet
  userRatingId: string | null;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  address?: string;
  role?: string;
  storeName?: string;
  general?: string;
}
