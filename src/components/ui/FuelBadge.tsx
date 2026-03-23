/**
 * components/ui/FuelBadge.tsx
 * Displays a single fuel type with availability status and optional price.
 */

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FUEL_LABELS, FUEL_COLORS, type FuelType } from '@/types';

interface Props {
  fuel:      FuelType;
  available: boolean;
  price?:    number;
  compact?:  boolean;
}

export function FuelBadge({ fuel, available, price, compact }: Props) {
  const color = FUEL_COLORS[fuel];

  /* ── Compact pill (used in list rows) ───────────────────────────────────── */
  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
          available ? 'opacity-100' : 'opacity-35',
        )}
        style={{ backgroundColor: color + '22', color }}
      >
        {available ? <Check size={9} /> : <X size={9} />}
        {FUEL_LABELS[fuel]}
      </span>
    );
  }

  /* ── Full row (used in detail cards) ────────────────────────────────────── */
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl px-3 py-2.5 transition-all',
        available
          ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
          : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 opacity-55',
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm text-gray-800 dark:text-gray-200">
          {FUEL_LABELS[fuel]}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {price !== undefined && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ฿{price.toFixed(2)}
          </span>
        )}
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full text-white flex-shrink-0"
          style={{ backgroundColor: available ? '#10b981' : '#ef4444' }}
        >
          {available ? <Check size={11} /> : <X size={11} />}
        </span>
      </div>
    </div>
  );
}
