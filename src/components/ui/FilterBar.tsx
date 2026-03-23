/**
 * components/ui/FilterBar.tsx
 * Horizontal scrollable filter chips for fuel type, availability and province.
 */

'use client';

import { useStore } from '@/lib/store';
import { FUEL_LABELS, FUEL_COLORS, PROVINCES, type FuelType } from '@/types';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const FUEL_LIST = Object.keys(FUEL_LABELS) as FuelType[];

export function FilterBar() {
  const { filters, setFilters } = useStore();
  const hasFilters = !!(filters.fuelType || filters.province || filters.available);

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">

      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={() => setFilters({ fuelType: undefined, province: undefined, available: undefined })}
          className="flex-shrink-0 flex items-center gap-1 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full"
        >
          <X size={10} />
          ล้าง
        </button>
      )}

      {/* Available toggle */}
      <button
        onClick={() => setFilters({ available: filters.available ? undefined : true })}
        className={cn(
          'flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all border whitespace-nowrap',
          filters.available
            ? 'bg-emerald-500 text-white border-emerald-500'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
        )}
      >
        ✅ มีน้ำมัน
      </button>

      {/* Fuel type chips */}
      {FUEL_LIST.map(fuel => {
        const active = filters.fuelType === fuel;
        return (
          <button
            key={fuel}
            onClick={() => setFilters({ fuelType: active ? undefined : fuel })}
            className={cn(
              'flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all border whitespace-nowrap',
              active
                ? 'text-white border-transparent'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
            )}
            style={active
              ? { backgroundColor: FUEL_COLORS[fuel], borderColor: FUEL_COLORS[fuel] }
              : {}}
          >
            {FUEL_LABELS[fuel]}
          </button>
        );
      })}

      {/* Province select */}
      <select
        value={filters.province ?? ''}
        onChange={e => setFilters({ province: e.target.value || undefined })}
        className={cn(
          'flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all cursor-pointer',
          'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300',
          'focus:outline-none focus:ring-2 focus:ring-brand-400',
          filters.province
            ? 'border-brand-400 text-brand-600 dark:text-brand-400'
            : 'border-gray-200 dark:border-gray-700',
        )}
      >
        <option value="">🗺️ ทุกจังหวัด</option>
        {PROVINCES.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
}
