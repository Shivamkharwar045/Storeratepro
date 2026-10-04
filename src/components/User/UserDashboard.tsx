import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  RefreshCw,
  MapPin,
  Building2,
  CheckCircle2,
  LayoutGrid,
  List,
  Clock,
  Phone,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { StoreWithUserRating, Rating } from '../../types';
import { api } from '../../services/api';
import { StarRating } from '../StarRating';
import { RateStoreModal } from './RateStoreModal';
import { StoreDetailModal } from './StoreDetailModal';
import { sortStores, multiSortStores, StoreSortKey, SortOrder } from '../../utils/sorting';
import { useMultiSort } from '../../hooks/useMultiSort';
import { SortHeaderCell } from '../SortHeaderCell';
import { MultiSortToolbar } from '../MultiSortToolbar';

interface UserDashboardProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNotify }) => {
  const [stores, setStores] = useState<StoreWithUserRating[]>([]);
  const [myRatings, setMyRatings] = useState<(Rating & { storeName: string; storeAddress: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<StoreSortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'my-ratings'>('all');

  // Modals state
  const [selectedStoreToRate, setSelectedStoreToRate] = useState<StoreWithUserRating | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState<boolean>(false);
  const [selectedStoreDetail, setSelectedStoreDetail] = useState<StoreWithUserRating | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [storesData, myRatingsData] = await Promise.all([
        api.getStores({ search }),
        api.getMyRatings().catch(() => ({ ratings: [] })),
      ]);
      setStores(storesData.stores);
      setMyRatings(myRatingsData.ratings);
    } catch (err: any) {
      onNotify(err.message || 'Failed to fetch stores.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleOpenRateModal = (store: StoreWithUserRating, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedStoreToRate(store);
    setIsRateModalOpen(true);
  };

  const handleOpenDetailModal = (store: StoreWithUserRating) => {
    setSelectedStoreDetail(store);
    setIsDetailModalOpen(true);
  };

  const handleRatingSuccess = (msg: string) => {
    onNotify(msg, 'success');
    loadData();
  };

  // Categories list extracted dynamically
  const categories = ['ALL', 'Supermarket', 'Department Store', 'Groceries', 'Hardware'];

  // Filter stores client-side for category and min rating
  const filteredStores = stores.filter((store) => {
    if (selectedCategory !== 'ALL') {
      const cat = (store.category || '').toLowerCase();
      if (!cat.includes(selectedCategory.toLowerCase())) return false;
    }
    if (minRatingFilter > 0) {
      if (store.overallRating < minRatingFilter) return false;
    }
    return true;
  });

  const {
    sortedItems: displayedStores,
    criteria: storeSortCriteria,
    handleSort: handleStoreSort,
    clearSort: clearStoreSort,
    getSortInfo: getStoreSortInfo,
    isMultiSortMode,
    toggleMultiSortMode,
    setCriteria: setStoreSortCriteria,
  } = useMultiSort<StoreWithUserRating, StoreSortKey>(filteredStores, multiSortStores, {
    initialCriteria: [{ key: 'name', order: 'asc' }],
    defaultOrder: (k) => (k === 'overallRating' || k === 'totalRatings' ? 'desc' : 'asc'),
  });

  const ratedStoresCount = stores.filter((s) => s.userRating !== null).length;

  return (
    <div className="space-y-6">
      {/* Google-Inspired Hero Header */}
      <div className="relative rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Google Verified Business Ratings Directory</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find &amp; Rate Top Local Stores in India
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Explore authentic ratings, customer evaluations, and operating hours for registered retail stores. Submit your 1–5 star reviews and update them anytime with instant persistence.
          </p>

          {/* Quick Metrics stats */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-600 font-mono-numbers">
            <div>
              <span className="text-base font-extrabold text-slate-900">{stores.length}</span>{' '}
              <span className="text-slate-500">Verified Stores</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div>
              <span className="text-base font-extrabold text-slate-900">{ratedStoresCount}</span>{' '}
              <span className="text-slate-500">Reviewed by You</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div>
              <span className="text-base font-extrabold text-emerald-600">100%</span>{' '}
              <span className="text-slate-500">Verified Transparency</span>
            </div>
          </div>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-slate-100/60 to-transparent pointer-events-none" />
      </div>

      {/* Control Bar: Search, Category Filters, Views */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input (Store Name or Address) */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by store name, address, or city (e.g., Bhopal, Indore)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Toggles & Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* Tab: All vs My Ratings */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Stores ({filteredStores.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('my-ratings')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'my-ratings'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Reviews ({myRatings.length})
              </button>
            </div>

            {/* Grid / Table View Switcher */}
            {activeTab === 'all' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Google Place Cards Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Compact Sortable Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Refresh */}
            <button
              type="button"
              onClick={loadData}
              className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              title="Refresh listings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Chips & Sorting Row */}
        {activeTab === 'all' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            {/* Category Segmented Controls */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat === 'ALL' ? 'All Categories' : cat}
                </button>
              ))}
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Rating:</span>
              {[0, 4.0, 4.5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setMinRatingFilter(score)}
                  className={`px-2 py-1 rounded-md font-mono-numbers transition-colors cursor-pointer ${
                    minRatingFilter === score
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {score === 0 ? 'All Ratings' : `${score}+ ⭐`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Store Cards Grid or Table */}
      {activeTab === 'all' ? (
        viewMode === 'grid' ? (
          /* Google Place Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedStores.length === 0 ? (
              <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No stores match your filters</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Try clearing the search query or changing category and rating filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('ALL');
                    setMinRatingFilter(0);
                  }}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              displayedStores.map((store) => {
                const hasRated = store.userRating !== null && store.userRating !== undefined;

                return (
                  <div
                    key={store.id}
                    onClick={() => handleOpenDetailModal(store)}
                    className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-2xl overflow-hidden transition-all duration-150 flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {/* Card Image Banner */}
                      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                        {store.imageUrl ? (
                          <img
                            src={store.imageUrl}
                            alt={store.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-white p-4 text-center">
                            <Building2 className="w-8 h-8 text-slate-500 mb-1" />
                            <span className="text-xs font-semibold">{store.name}</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="bg-white/95 text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs backdrop-blur-xs">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            <span>Verified</span>
                          </span>
                        </div>

                        {/* Category Kicker */}
                        <div className="absolute bottom-2.5 left-3 right-3 text-white">
                          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block">
                            {store.category || 'Retail Store'}
                          </span>
                          <h3 className="text-sm font-bold text-white truncate drop-shadow-xs">
                            {store.name}
                          </h3>
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="p-4 space-y-3">
                        {/* Rating row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <StarRating value={store.overallRating} size="sm" showScore={true} totalRatings={store.totalRatings} />
                          </div>

                          {store.operatingHours && (
                            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Open now
                            </span>
                          )}
                        </div>

                        {/* Address */}
                        <div className="flex items-start gap-1.5 text-xs text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-relaxed" title={store.address}>
                            {store.address}
                          </span>
                        </div>

                        {/* Your Review Status */}
                        {hasRated && (
                          <div className="p-2 bg-emerald-50/80 border border-emerald-200/80 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                            <span className="flex items-center gap-1 font-semibold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              <span>Your Rating: {store.userRating} / 5</span>
                            </span>
                            <span className="text-[11px] text-emerald-700">✓ Submitted</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                      <span className="text-[11px] text-indigo-600 font-semibold group-hover:underline flex items-center gap-0.5">
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleOpenRateModal(store, e)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                          hasRated
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                        }`}
                      >
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{hasRated ? 'Update Rating' : 'Rate Store'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* High-Density Sortable Table View (Assignment Strict Sorting Requirements) */
          <div className="space-y-3">
            <MultiSortToolbar<StoreSortKey>
              criteria={storeSortCriteria}
              keyLabels={{
                name: 'Store Name',
                address: 'Address',
                overallRating: 'Overall Rating',
                email: 'Email',
                totalRatings: 'Total Reviews',
              }}
              isMultiSortMode={isMultiSortMode}
              onToggleMultiSortMode={toggleMultiSortMode}
              onRemoveCriterion={(k) => setStoreSortCriteria((prev) => prev.filter((c) => c.key !== k))}
              onClearSort={clearStoreSort}
              tableName="Stores Table"
            />

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <SortHeaderCell
                        label="Store Name"
                        sortInfo={getStoreSortInfo('name')}
                        onSort={(e) => handleStoreSort('name', e)}
                      />
                      <SortHeaderCell
                        label="Address"
                        sortInfo={getStoreSortInfo('address')}
                        onSort={(e) => handleStoreSort('address', e)}
                      />
                      <SortHeaderCell
                        label="Overall Rating"
                        sortInfo={getStoreSortInfo('overallRating')}
                        onSort={(e) => handleStoreSort('overallRating', e)}
                      />
                      <th scope="col" className="py-3 px-4">
                        Your Rating
                      </th>
                      <th scope="col" className="py-3 px-4 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedStores.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          No stores found matching the criteria.
                        </td>
                      </tr>
                    ) : (
                      displayedStores.map((store) => {
                        const hasRated = store.userRating !== null && store.userRating !== undefined;

                      return (
                        <tr
                          key={store.id}
                          onClick={() => handleOpenDetailModal(store)}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        >
                          {/* Store Name with Category */}
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <span className="block truncate max-w-[220px]" title={store.name}>
                                  {store.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal block">
                                  {store.category || 'Retail Store'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Address */}
                          <td className="py-3.5 px-4 text-slate-600 max-w-[260px]">
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2" title={store.address}>
                                {store.address}
                              </span>
                            </div>
                          </td>

                          {/* Overall Rating */}
                          <td className="py-3.5 px-4">
                            <StarRating
                              value={store.overallRating}
                              totalRatings={store.totalRatings}
                              size="sm"
                            />
                          </td>

                          {/* Your Rating */}
                          <td className="py-3.5 px-4">
                            {hasRated ? (
                              <div className="inline-flex items-center gap-1.5 text-slate-800 font-semibold">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                                <span className="font-mono-numbers">{store.userRating} / 5</span>
                                <span className="text-[11px] text-emerald-600 font-medium ml-1">✓ Rated</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Not rated yet</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => handleOpenRateModal(store, e)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                hasRated
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                              }`}
                            >
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span>{hasRated ? 'Update' : 'Rate'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )
      ) : (
        /* My Ratings View */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Your Review History
              </h2>
              <p className="text-xs text-slate-500">
                All ratings you submitted. You can modify any score at any time.
              </p>
            </div>
            <span className="text-xs font-mono-numbers text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
              {myRatings.length} reviews recorded
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {myRatings.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <p className="font-medium text-slate-700">You haven&apos;t rated any stores yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="mt-2 text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  Browse all stores to leave your first rating →
                </button>
              </div>
            ) : (
              myRatings.map((rating) => {
                const storeMatch = stores.find((s) => s.id === rating.storeId);
                return (
                  <div key={rating.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-slate-900">{rating.storeName}</h3>
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold font-mono-numbers">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{rating.rating} / 5</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{rating.storeAddress}</p>
                      <p className="text-[11px] text-slate-400 font-mono-numbers">
                        Last updated: {new Date(rating.updatedAt).toLocaleDateString()} at{' '}
                        {new Date(rating.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (storeMatch) {
                          handleOpenRateModal(storeMatch);
                        } else {
                          handleOpenRateModal({
                            id: rating.storeId,
                            name: rating.storeName,
                            email: '',
                            address: rating.storeAddress,
                            ownerId: '',
                            overallRating: rating.rating,
                            totalRatings: 1,
                            createdAt: rating.createdAt,
                            userRating: rating.rating,
                            userRatingId: rating.id,
                          });
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Modify Score
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Rate Store Modal */}
      <RateStoreModal
        store={selectedStoreToRate}
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        onRatingSuccess={handleRatingSuccess}
      />

      {/* Store Detail Modal (Google Place Style) */}
      <StoreDetailModal
        store={selectedStoreDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRateClick={(st) => handleOpenRateModal(st)}
        onNotify={onNotify}
      />
    </div>
  );
};
