/**
 * components/ui/ConfidenceMeter.tsx
 * Visual bar showing crowd-sourced confidence score.
 */

import { confidenceColor } from '@/lib/utils';

interface Props { score: number; showLabel?: boolean }

export function ConfidenceMeter({ score, showLabel = true }: Props) {
  const color = confidenceColor(score);
  const label = score >= 80 ? 'น่าเชื่อถือมาก' : score >= 60 ? 'ค่อนข้างน่าเชื่อถือ' : 'ข้อมูลเก่า';

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">ความน่าเชื่อถือ</span>
          <span className="font-semibold" style={{ color }}>
            {score}% · {label}
          </span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
