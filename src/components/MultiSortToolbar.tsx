import React from 'react';
import { Layers, X, RotateCcw, HelpCircle } from 'lucide-react';
import { SortCriterion } from '../utils/sorting';

interface MultiSortToolbarProps<K extends string> {
  criteria: SortCriterion<K>[];
  keyLabels: Record<K, string>;
  isMultiSortMode: boolean;
  onToggleMultiSortMode: () => void;
  onRemoveCriterion: (key: K) => void;
  onClearSort: () => void;
  tableName?: string;
}

export function MultiSortToolbar<K extends string>({
  criteria,
  keyLabels,
  isMultiSortMode,
  onToggleMultiSortMode,
  onRemoveCriterion,
  onClearSort,
  tableName = 'Table',
}: MultiSortToolbarProps<K>) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
      {/* Left: Active Criteria Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-500 font-medium flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Active Sort:</span>
        </span>

        {criteria.length === 0 ? (
          <span className="text-slate-400 italic text-[11px]">Default natural order</span>
        ) : (
          criteria.map((c, idx) => (
            <span
              key={c.key}
              className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-lg shadow-2xs font-medium text-[11px]"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-700 font-mono text-[9px] font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <span>{keyLabels[c.key] || c.key}</span>
              <span className="font-mono text-blue-600 font-bold">
                {c.order === 'asc' ? '↑' : '↓'}
              </span>
              <button
                type="button"
                onClick={() => onRemoveCriterion(c.key)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                title={`Remove ${keyLabels[c.key] || c.key} from sort`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}

        {criteria.length > 0 && (
          <button
            type="button"
            onClick={onClearSort}
            className="text-[11px] text-slate-500 hover:text-slate-800 underline underline-offset-2 ml-1 cursor-pointer flex items-center gap-0.5"
            title="Reset to default sorting"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Right: Multi-sort mode toggle & hint */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMultiSortMode}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 border ${
            isMultiSortMode
              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
          title="Toggle multi-column sorting mode (adds columns on every click without Shift key)"
        >
          <Layers className="w-3 h-3" />
          <span>Multi-Sort: {isMultiSortMode ? 'ON' : 'OFF'}</span>
        </button>

        <span
          className="text-slate-400 text-[11px] hidden sm:inline-flex items-center gap-1"
          title="Hold the Shift key while clicking table column headers to sort by multiple columns (e.g. Rating then Name)."
        >
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>Shift + Click header to chain sort</span>
        </span>
      </div>
    </div>
  );
}
