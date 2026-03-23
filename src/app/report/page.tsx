/**
 * app/report/page.tsx
 * Crowdsourced fuel status report form.
 * Inner component uses useSearchParams — must be wrapped in Suspense.
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams }    from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { submitReport, getStation } from '@/lib/firestore';
import { useStore }   from '@/lib/store';
import { useAuth }    from '@/hooks/useAuth';
import { FUEL_LABELS, FUEL_COLORS } from '@/types';
import type { FuelType, ReportStatus, Station } from '@/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const FUEL_LIST = Object.keys(FUEL_LABELS) as FuelType[];

const STATUS_OPTIONS: { value: ReportStatus; label: string; Icon: typeof CheckCircle; color: string }[] = [
  { value: 'available',    label: 'มีน้ำมัน',   Icon: CheckCircle,   color: '#10B981' },
  { value: 'running_low', label: 'เหลือน้อย',   Icon: AlertTriangle, color: '#F59E0B' },
  { value: 'unavailable', label: 'น้ำมันหมด',   Icon: XCircle,       color: '#EF4444' },
];

// ── Inner component that uses useSearchParams ──────────────────────────────────
function ReportForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const stationId    = searchParams.get('stationId') ?? '';

  const { user } = useStore();
  const { signInWithGoogle } = useAuth();

  const [station,    setStation]    = useState<Station | null>(null);
  const [fuelType,   setFuelType]   = useState<FuelType>('diesel');
  const [status,     setStatus]     = useState<ReportStatus>('available');
  const [price,      setPrice]      = useState('');
  const [note,       setNote]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);

  useEffect(() => {
    if (stationId) getStation(stationId).then(setStation);
  }, [stationId]);

  const handleSubmit = async () => {
    if (!user)      { toast.error('กรุณาเข้าสู่ระบบก่อน');  return; }
    if (!stationId) { toast.error('กรุณาเลือกสถานีก่อน');   return; }

    setSubmitting(true);
    try {
      await submitReport({
        stationId,
        userId:  user.uid,
        fuelType,
        status,
        price: price ? parseFloat(price) : undefined,
        note:  note  || undefined,
      });
      setDone(true);
      toast.success('✅ ขอบคุณที่ช่วยรายงาน! คะแนนของคุณเพิ่มขึ้น +2');
    } catch {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto px-6 pt-24 flex flex-col items-center text-center animate-slide-up pb-24">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">ขอบคุณ!</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          รายงานของคุณช่วยให้ผู้ขับขี่คนอื่นวางแผนได้ดีขึ้น
        </p>
        <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl px-6 py-3">
          <p className="text-emerald-600 font-semibold text-sm">+2 คะแนนความน่าเชื่อถือ 🏆</p>
        </div>
        <div className="mt-8 flex gap-3 w-full">
          <button
            onClick={() => { setDone(false); setNote(''); setPrice(''); }}
            className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            รายงานอีกครั้ง
          </button>
          <button
            onClick={() => stationId ? router.push(`/station/${stationId}`) : router.push('/')}
            className="flex-1 py-3 rounded-2xl bg-brand-500 text-white text-sm font-semibold"
          >
            กลับไป
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-semibold text-gray-900 dark:text-white">รายงานสถานะน้ำมัน</h1>
          {station && <p className="text-xs text-gray-400 mt-0.5 truncate">{station.name}</p>}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5 animate-slide-up">

        {/* Auth gate */}
        {!user && (
          <div className="bg-brand-50 dark:bg-orange-900/20 rounded-3xl p-5 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              เข้าสู่ระบบเพื่อรายงานและรับคะแนนความน่าเชื่อถือ
            </p>
            <button
              onClick={signInWithGoogle}
              className="bg-brand-500 text-white font-semibold px-6 py-2.5 rounded-2xl text-sm"
            >
              เข้าสู่ระบบด้วย Google
            </button>
          </div>
        )}

        {/* Fuel type */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">เลือกประเภทน้ำมัน</p>
          <div className="grid grid-cols-3 gap-2">
            {FUEL_LIST.map(fuel => (
              <button
                key={fuel}
                onClick={() => setFuelType(fuel)}
                className={cn(
                  'py-2.5 px-2 rounded-2xl text-xs font-semibold transition-all border',
                  fuelType === fuel
                    ? 'text-white border-transparent shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
                )}
                style={fuelType === fuel
                  ? { backgroundColor: FUEL_COLORS[fuel], borderColor: FUEL_COLORS[fuel] }
                  : {}}
              >
                {FUEL_LABELS[fuel]}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">สถานะปัจจุบัน</p>
          <div className="space-y-2">
            {STATUS_OPTIONS.map(({ value, label, Icon, color }) => {
              const active = status === value;
              return (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left',
                    active
                      ? 'shadow-sm'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
                  )}
                  style={active
                    ? { backgroundColor: color + '18', borderColor: color }
                    : {}}
                >
                  <Icon size={20} style={{ color }} />
                  <span className={cn(
                    'font-semibold text-sm',
                    active ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300',
                  )}>
                    {label}
                  </span>
                  {active && (
                    <span
                      className="ml-auto h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <CheckCircle size={12} className="text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ราคา (ถ้าทราบ)</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">฿</span>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="เช่น 29.94"
              step="0.01"
              min="0"
              className="w-full pl-8 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">หมายเหตุ (ไม่จำเป็น)</p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="เช่น รอคิวนาน / เปิดแค่ตอนเช้า..."
            rows={2}
            maxLength={120}
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{note.length}/120</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !user}
          className={cn(
            'w-full py-4 rounded-2xl font-semibold text-white text-base transition-all',
            'bg-brand-500 hover:bg-brand-600 active:bg-brand-700',
            (submitting || !user) && 'opacity-50 cursor-not-allowed',
          )}
        >
          {submitting ? 'กำลังส่ง...' : '📤 ส่งรายงาน'}
        </button>

        <p className="text-xs text-center text-gray-400 pb-2">
          ข้อมูลที่ส่งจะถูกตรวจสอบโดยชุมชน · รายงานที่ไม่ตรงจะลดคะแนนของคุณ
        </p>
      </div>
    </div>
  );
}

// ── Page export — wraps inner component in Suspense ───────────────────────────
export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto px-4 pt-8 space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
      </div>
    }>
      <ReportForm />
    </Suspense>
  );
}
