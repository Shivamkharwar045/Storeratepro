import React, { useState, useEffect } from 'react';
import { Store, Star, Users, MapPin, Mail, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Download, FileSpreadsheet } from 'lucide-react';
import { StoreOwnerDashboardData, Rating } from '../../types';
import { api } from '../../services/api';
import { StarRating } from '../StarRating';
import { SortHeaderCell } from '../SortHeaderCell';
import { MultiSortToolbar } from '../MultiSortToolbar';
import { useMultiSort } from '../../hooks/useMultiSort';
import { multiSortRatings, RatingSortKey } from '../../utils/sorting';

interface StoreOwnerDashboardProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const StoreOwnerDashboard: React.FC<StoreOwnerDashboardProps> = ({ onNotify }) => {
  const [data, setData] = useState<StoreOwnerDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getStoreOwnerDashboard();
      setData(res);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load store owner dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportReviewsCSV = () => {
    if (!data?.ratings || data.ratings.length === 0) {
      onNotify('No reviews available to export yet.', 'error');
      return;
    }
    const headers = ['Rating ID', 'Customer Name', 'Rating Stars', 'Customer Address', 'Date Submitted'];
    const rows = data.ratings.map((r) => [
      `"${r.id}"`,
      `"${(r.userName || '').replace(/"/g, '""')}"`,
      r.rating,
      `"${(r.userAddress || '').replace(/"/g, '""')}"`,
      `"${new Date(r.updatedAt || r.createdAt).toLocaleDateString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(data?.store?.name || 'store').replace(/\s+/g, '_')}_reviews.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('Exported reviews report successfully as CSV.', 'success');
  };

  // Filter user ratings unconditionally before any returns (Rules of Hooks)
  const filteredRatings = (data?.ratings || []).filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.userName && r.userName.toLowerCase().includes(q)) ||
      (r.userAddress && r.userAddress.toLowerCase().includes(q))
    );
  });

  const {
    sortedItems: sortedRatings,
    criteria: ratingCriteria,
    handleSort: handleRatingSort,
    clearSort: clearRatingSort,
    getSortInfo: getRatingSortInfo,
    isMultiSortMode: isRatingMultiSortMode,
    toggleMultiSortMode: toggleRatingMultiSortMode,
    setCriteria: setRatingCriteria,
  } = useMultiSort<Rating, RatingSortKey>(filteredRatings, multiSortRatings, {
    initialCriteria: [{ key: 'updatedAt', order: 'desc' }],
    defaultOrder: (k) => (k === 'rating' || k === 'updatedAt' ? 'desc' : 'asc'),
  });

  if (loading && !data) {
    return (
      <div className="py-20 text-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
        <p className="text-xs">Loading Store Owner console...</p>
      </div>
    );
  }

  const store = data?.store;

  if (!store) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-lg mx-auto">
        <Store className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">No Store Assigned Yet</h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Your account is registered as a Store Owner, but no store has been linked to your account by the System Administrator yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Store Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase tracking-wider">
              Store Owner Console
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{store.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{store.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{store.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportReviewsCSV}
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download customer feedback as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={loadData}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              title="Refresh statistics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI & Rating Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Overall Score Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Overall Average Rating
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 font-mono-numbers">
                {data.overallRating > 0 ? data.overallRating.toFixed(1) : '0.0'}
              </span>
              <span className="text-slate-400 text-sm font-semibold">/ 5.0</span>
            </div>
            <div className="mt-2">
              <StarRating value={data.overallRating} size="lg" showScore={false} />
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Based on customer feedback</span>
            <span className="font-mono-numbers font-semibold text-slate-800">
              {data.totalRatings} {data.totalRatings === 1 ? 'rating' : 'ratings'}
            </span>
          </div>
        </div>

        {/* Total Reviews Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Total Customer Reviews
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 font-mono-numbers">
                  {data.totalRatings}
                </div>
                <div className="text-xs text-slate-500">Verified unique reviewers</div>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
            Ratings update in real-time when users modify their scores
          </div>
        </div>

        {/* Star Distribution Histogram */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Rating Distribution
          </div>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = data.ratingDistribution[stars] || 0;
              const pct = data.totalRatings > 0 ? (count / data.totalRatings) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-10 text-slate-600 font-mono-numbers text-right">
                    {stars} ⭐
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-[11px] text-slate-500 font-mono-numbers text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Users Who Rated Table (Assignment requirement: "Kis user ne rating di hai, dekh sakta hai") */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Users Who Rated Your Store
            </h2>
            <p className="text-xs text-slate-500">
              Complete log of registered users and their submitted scores
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by customer name or city..."
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 w-full sm:w-64"
          />
        </div>

        {/* Multi-Sort Toolbar */}
        <div className="p-3 border-b border-slate-100">
          <MultiSortToolbar<RatingSortKey>
            criteria={ratingCriteria}
            keyLabels={{
              userName: 'Customer Name',
              rating: 'Rating Given',
              updatedAt: 'Date Reviewed',
              createdAt: 'Date Submitted',
            }}
            isMultiSortMode={isRatingMultiSortMode}
            onToggleMultiSortMode={toggleRatingMultiSortMode}
            onRemoveCriterion={(k) => setRatingCriteria((prev) => prev.filter((c) => c.key !== k))}
            onClearSort={clearRatingSort}
            tableName="Customer Ratings"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <SortHeaderCell
                  label="Customer Name"
                  sortInfo={getRatingSortInfo('userName')}
                  onSort={(e) => handleRatingSort('userName', e)}
                />
                <SortHeaderCell
                  label="Rating Given"
                  sortInfo={getRatingSortInfo('rating')}
                  onSort={(e) => handleRatingSort('rating', e)}
                />
                <th scope="col" className="py-3 px-4">
                  Customer Address
                </th>
                <SortHeaderCell
                  label="Date Reviewed"
                  sortInfo={getRatingSortInfo('updatedAt')}
                  onSort={(e) => handleRatingSort('updatedAt', e)}
                  align="right"
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRatings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No ratings have been submitted for your store yet.
                  </td>
                </tr>
              ) : (
                sortedRatings.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {r.userName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        <span className="font-bold text-slate-900 font-mono-numbers">
                          {r.rating}
                        </span>
                        <span className="text-slate-400 text-[11px]">/ 5</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[280px] truncate" title={r.userAddress}>
                      {r.userAddress || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 font-mono-numbers text-[11px]">
                      {new Date(r.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
