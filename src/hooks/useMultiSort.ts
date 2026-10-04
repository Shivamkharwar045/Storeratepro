import { useState, useMemo, useCallback } from 'react';
import { SortCriterion, SortOrder } from '../utils/sorting';

export interface UseMultiSortOptions<K extends string> {
  initialCriteria?: SortCriterion<K>[];
  maxCriteria?: number;
  defaultOrder?: (key: K) => SortOrder;
}

export interface SortInfo {
  isSorted: boolean;
  order?: SortOrder;
  priority?: number; // 1-based index (1 = primary, 2 = secondary, etc.)
}

export function useMultiSort<T, K extends string>(
  items: T[],
  sortFn: (items: T[], criteria: SortCriterion<K>[]) => T[],
  options: UseMultiSortOptions<K> = {}
) {
  const {
    initialCriteria = [],
    maxCriteria = 3,
    defaultOrder = () => 'asc',
  } = options;

  const [criteria, setCriteria] = useState<SortCriterion<K>[]>(initialCriteria);
  const [isMultiSortMode, setIsMultiSortMode] = useState<boolean>(false);

  /**
   * Handles column header click.
   * Supports both keyboard (Shift + Click) and UI toggle (isMultiSortMode).
   */
  const handleSort = useCallback(
    (key: K, event?: React.MouseEvent | boolean) => {
      // Determine if multi-sort is triggered via Shift key or explicit boolean/mode
      const isShiftPressed = typeof event === 'object' && event !== null && 'shiftKey' in event ? event.shiftKey : false;
      const isMulti = typeof event === 'boolean' ? event : (isShiftPressed || isMultiSortMode);

      setCriteria((prevCriteria) => {
        const existingIndex = prevCriteria.findIndex((c) => c.key === key);

        if (!isMulti) {
          // Single-column sort mode: replace all criteria
          if (existingIndex !== -1 && prevCriteria.length === 1) {
            // Toggle existing single criterion
            const currentOrder = prevCriteria[0].order;
            return [{ key, order: currentOrder === 'asc' ? 'desc' : 'asc' }];
          }
          // Set new single criterion with its default order
          return [{ key, order: defaultOrder(key) }];
        }

        // Multi-column sort mode:
        if (existingIndex !== -1) {
          const currentCriterion = prevCriteria[existingIndex];
          if (currentCriterion.order === 'asc') {
            // Transition asc -> desc
            const updated = [...prevCriteria];
            updated[existingIndex] = { key, order: 'desc' };
            return updated;
          } else {
            // Transition desc -> remove from criteria
            return prevCriteria.filter((c) => c.key !== key);
          }
        }

        // Add new column to multi-sort criteria (capped at maxCriteria)
        if (prevCriteria.length >= maxCriteria) {
          // Drop oldest secondary criterion or cap
          const sliced = prevCriteria.slice(0, maxCriteria - 1);
          return [...sliced, { key, order: defaultOrder(key) }];
        }

        return [...prevCriteria, { key, order: defaultOrder(key) }];
      });
    },
    [defaultOrder, isMultiSortMode, maxCriteria]
  );

  /**
   * Resets all sorting criteria to empty or initial.
   */
  const clearSort = useCallback(() => {
    setCriteria(initialCriteria);
  }, [initialCriteria]);

  /**
   * Helper to get sorting state for a specific column key.
   */
  const getSortInfo = useCallback(
    (key: K): SortInfo => {
      const index = criteria.findIndex((c) => c.key === key);
      if (index === -1) {
        return { isSorted: false };
      }
      return {
        isSorted: true,
        order: criteria[index].order,
        priority: criteria.length > 1 ? index + 1 : undefined,
      };
    },
    [criteria]
  );

  /**
   * Sorted items memoized against items and criteria.
   */
  const sortedItems = useMemo(() => {
    return sortFn(items, criteria);
  }, [items, criteria, sortFn]);

  const isMultiSortActive = criteria.length > 1;

  const toggleMultiSortMode = useCallback(() => {
    setIsMultiSortMode((prev) => !prev);
  }, []);

  return {
    sortedItems,
    criteria,
    setCriteria,
    handleSort,
    clearSort,
    getSortInfo,
    isMultiSortActive,
    isMultiSortMode,
    toggleMultiSortMode,
  };
}
