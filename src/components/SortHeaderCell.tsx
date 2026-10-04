import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { SortInfo } from '../hooks/useMultiSort';

interface SortHeaderCellProps {
  label: string;
  sortInfo: SortInfo;
  onSort: (e: React.MouseEvent) => void;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const SortHeaderCell: React.FC<SortHeaderCellProps> = ({
  label,
  sortInfo,
  onSort,
  className = '',
  align = 'left',
}) => {
  const { isSorted, order, priority } = sortInfo;

  const alignClasses = {
    left: 'justify-start text-left',
    center: 'justify-center text-center',
    right: 'justify-end text-right',
  }[align];

  return (
    <th
      scope="col"
      onClick={onSort}
      title={`${label}: Click to sort (Hold Shift for multi-column sort)`}
      className={`py-3 px-4 cursor-pointer select-none transition-colors group hover:text-slate-900 ${
        isSorted ? 'text-slate-900 font-bold bg-slate-100/60' : 'text-slate-600'
      } ${className}`}
    >
      <div className={`flex items-center gap-1.5 ${alignClasses}`}>
        <span>{label}</span>

        <div className="inline-flex items-center gap-0.5 shrink-0">
          {isSorted ? (
            order === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold transition-transform" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold transition-transform" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 opacity-60 group-hover:opacity-100 transition-opacity" />
          )}

          {/* Multi-column priority badge (1, 2, 3) */}
          {priority !== undefined && (
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[9px] font-extrabold shadow-2xs leading-none"
              title={`Sort Priority #${priority}`}
            >
              {priority}
            </span>
          )}
        </div>
      </div>
    </th>
  );
};
