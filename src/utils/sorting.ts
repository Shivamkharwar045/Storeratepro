import { Store, StoreWithUserRating, User, Rating } from '../types';

export type SortOrder = 'asc' | 'desc';

export interface SortCriterion<K extends string = string> {
  key: K;
  order: SortOrder;
}

export type StoreSortKey = 'name' | 'email' | 'address' | 'overallRating' | 'totalRatings';
export type UserSortKey = 'name' | 'email' | 'address' | 'role' | 'createdAt' | 'storeRating';
export type RatingSortKey = 'userName' | 'rating' | 'updatedAt' | 'createdAt';

/**
 * Compare two strings with case-insensitivity and locale awareness.
 */
export const compareStrings = (
  a?: string | null,
  b?: string | null,
  order: SortOrder = 'asc'
): number => {
  const strA = (a || '').trim().toLowerCase();
  const strB = (b || '').trim().toLowerCase();
  const result = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
  return order === 'asc' ? result : -result;
};

/**
 * Compare two numbers handling zeroes, nulls, and fractional ratings.
 */
export const compareNumbers = (
  a?: number | null,
  b?: number | null,
  order: SortOrder = 'asc'
): number => {
  const numA = typeof a === 'number' && !isNaN(a) ? a : 0;
  const numB = typeof b === 'number' && !isNaN(b) ? b : 0;
  if (numA === numB) return 0;
  const result = numA < numB ? -1 : 1;
  return order === 'asc' ? result : -result;
};

/**
 * Compare two date strings or timestamps.
 */
export const compareDates = (
  a?: string | Date | null,
  b?: string | Date | null,
  order: SortOrder = 'asc'
): number => {
  const timeA = a ? new Date(a).getTime() : 0;
  const timeB = b ? new Date(b).getTime() : 0;
  if (timeA === timeB) return 0;
  const result = timeA < timeB ? -1 : 1;
  return order === 'asc' ? result : -result;
};

/**
 * Toggles sort order or switches to a new column.
 * If clicking the active column: toggles asc <-> desc.
 * If clicking a new column: sets that column with 'asc' (or 'desc' for ratings).
 */
export const toggleSort = <T extends string>(
  currentKey: T,
  targetKey: T,
  currentOrder: SortOrder,
  defaultOrder: SortOrder = 'asc'
): { sortBy: T; sortOrder: SortOrder } => {
  if (currentKey === targetKey) {
    return {
      sortBy: targetKey,
      sortOrder: currentOrder === 'asc' ? 'desc' : 'asc',
    };
  }
  return {
    sortBy: targetKey,
    sortOrder: defaultOrder,
  };
};

/**
 * Utility function to sort store records by name, email, address, or rating (overallRating).
 * Strictly immutable - returns a newly sorted array.
 */
export const sortStores = <T extends Partial<Store | StoreWithUserRating> & { name: string; address: string; overallRating: number }>(
  stores: T[],
  sortBy: StoreSortKey = 'name',
  order: SortOrder = 'asc'
): T[] => {
  return [...stores].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return compareStrings(a.name, b.name, order);
      case 'email':
        return compareStrings(a.email, b.email, order);
      case 'address':
        return compareStrings(a.address, b.address, order);
      case 'overallRating':
        return compareNumbers(a.overallRating, b.overallRating, order);
      case 'totalRatings':
        return compareNumbers(a.totalRatings, b.totalRatings, order);
      default:
        return compareStrings(a.name, b.name, order);
    }
  });
};

/**
 * Utility function to sort user records by name, email, address, role, or joined date.
 * Strictly immutable - returns a newly sorted array.
 */
export const sortUsers = <T extends Partial<User> & { name: string; email: string; address: string; role: string }>(
  users: T[],
  sortBy: UserSortKey = 'name',
  order: SortOrder = 'asc'
): T[] => {
  return [...users].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return compareStrings(a.name, b.name, order);
      case 'email':
        return compareStrings(a.email, b.email, order);
      case 'address':
        return compareStrings(a.address, b.address, order);
      case 'role':
        return compareStrings(a.role, b.role, order);
      case 'createdAt':
        return compareDates(a.createdAt, b.createdAt, order);
      default:
        return compareStrings(a.name, b.name, order);
    }
  });
};

/**
 * Utility function to sort rating records by reviewer name, numerical rating, or date.
 * Strictly immutable - returns a newly sorted array.
 */
export const sortRatings = <T extends Partial<Rating> & { rating: number }>(
  ratings: T[],
  sortBy: RatingSortKey = 'updatedAt',
  order: SortOrder = 'desc'
): T[] => {
  return [...ratings].sort((a, b) => {
    switch (sortBy) {
      case 'userName':
        return compareStrings(a.userName, b.userName, order);
      case 'rating':
        return compareNumbers(a.rating, b.rating, order);
      case 'updatedAt':
        return compareDates(a.updatedAt, b.updatedAt, order);
      case 'createdAt':
        return compareDates(a.createdAt, b.createdAt, order);
      default:
        return compareDates(a.updatedAt, b.updatedAt, order);
    }
  });
};

/**
 * Generic multi-column sort comparator.
 * Applies sorting criteria sequentially: if the primary column is equal,
 * it moves to the secondary column, and so on.
 */
export const multiSortItems = <T>(
  items: T[],
  criteria: SortCriterion<any>[],
  comparatorMap: Record<string, (a: T, b: T, order: SortOrder) => number>
): T[] => {
  if (!criteria || criteria.length === 0) return [...items];

  return [...items].sort((a, b) => {
    for (const { key, order } of criteria) {
      const comparator = comparatorMap[key];
      if (comparator) {
        const result = comparator(a, b, order);
        if (result !== 0) return result;
      }
    }
    return 0;
  });
};

/**
 * Multi-column sort utility for stores.
 * Example: Sort by overallRating (desc), then by name (asc).
 */
export const multiSortStores = <T extends Partial<Store | StoreWithUserRating> & { name: string; address: string; overallRating: number; totalRatings?: number; email?: string }>(
  stores: T[],
  criteria: SortCriterion<StoreSortKey>[]
): T[] => {
  const storeComparators: Record<StoreSortKey, (a: T, b: T, order: SortOrder) => number> = {
    name: (a, b, order) => compareStrings(a.name, b.name, order),
    email: (a, b, order) => compareStrings(a.email, b.email, order),
    address: (a, b, order) => compareStrings(a.address, b.address, order),
    overallRating: (a, b, order) => compareNumbers(a.overallRating, b.overallRating, order),
    totalRatings: (a, b, order) => compareNumbers(a.totalRatings ?? 0, b.totalRatings ?? 0, order),
  };

  return multiSortItems(stores, criteria, storeComparators);
};

/**
 * Multi-column sort utility for users.
 * Example: Sort by role (asc), then by name (asc).
 */
export const multiSortUsers = <T extends Partial<User> & { name: string; email: string; address: string; role: string; createdAt: string; storeRating?: number | null }>(
  users: T[],
  criteria: SortCriterion<UserSortKey>[]
): T[] => {
  const userComparators: Record<UserSortKey, (a: T, b: T, order: SortOrder) => number> = {
    name: (a, b, order) => compareStrings(a.name, b.name, order),
    email: (a, b, order) => compareStrings(a.email, b.email, order),
    address: (a, b, order) => compareStrings(a.address, b.address, order),
    role: (a, b, order) => compareStrings(a.role, b.role, order),
    createdAt: (a, b, order) => compareDates(a.createdAt, b.createdAt, order),
    storeRating: (a, b, order) => compareNumbers(a.storeRating ?? 0, b.storeRating ?? 0, order),
  };

  return multiSortItems(users, criteria, userComparators);
};

/**
 * Multi-column sort utility for customer ratings.
 * Example: Sort by rating (desc), then by updatedAt (desc).
 */
export const multiSortRatings = <T extends Partial<Rating> & { rating: number }>(
  ratings: T[],
  criteria: SortCriterion<RatingSortKey>[]
): T[] => {
  const ratingComparators: Record<RatingSortKey, (a: T, b: T, order: SortOrder) => number> = {
    userName: (a, b, order) => compareStrings(a.userName, b.userName, order),
    rating: (a, b, order) => compareNumbers(a.rating, b.rating, order),
    updatedAt: (a, b, order) => compareDates(a.updatedAt, b.updatedAt, order),
    createdAt: (a, b, order) => compareDates(a.createdAt, b.createdAt, order),
  };

  return multiSortItems(ratings, criteria, ratingComparators);
};


