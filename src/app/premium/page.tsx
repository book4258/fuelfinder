/**
 * app/premium/page.tsx
 * Premium subscription page.
 */

'use client';

import { ArrowLeft, Bell, EyeOff, Zap, Bookmark, TrendingUp, Star, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore }  from '@/lib/store';
import toast         from 'react-hot-toast';

const FEATURES = [
  { Icon: Bell,       title: 'แจ้งเตือนน้ำมันใกล้บ้าน',   desc: 'รับแจ้งเตือนทันทีเมื่อน้ำมันหมดหรือเพิ่มในพื้นที่ของคุณ' },
  { Icon: EyeOff,     title: 'ปิดโฆษณาทั้งหมด',            desc: 'ใช้งานได้อย่างราบรื่นโดยไม่มีโฆษณาขัดจังหวะ' },
  { Icon: Zap,        title: 'AI วิเคราะห์ล่วงหน้า',        desc: 'คาดการณ์ว่าสถานีใดจะขาดน้ำมันในอีก 4 ชั่วโมง' },
  { Icon: Bookmark,   title: 'สถานีโปรดไม่จำกัด',           desc: 'บุ๊คมาร์คสถานีได้ไม่จำกัดพร้อมแจ้งเตือน' },
  { Icon: TrendingUp, title: 'กราฟราคาย้อนหลัง',             desc: 'ดูแนวโน้มราคาน้ำมันเพื่อวางแผนเติม' },
  { Icon: Star,       title: 'แบดจ์ผู้รายงานพิเศษ',          desc: 'แสดงสถานะ Premium ในโปรไฟล์' },
] as const;

const PLANS = [
  { id: 'monthly', label: 'รายเดือน', price: '49',  unit: 'บาท/เดือน', highlight: false },
  { id: 'yearly',  label: 'รายปี',    price: '399', unit: 'บาท/ปี',    highlight: true,  tag: 'ประหยัด 32%' },
] as const;

export default function PremiumPage() {
  const router   = useRouter();
  const { user } = useStore();

  const handleUpgrade = (planId: string) => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      router.push('/profile');
      return;
    }
    // TODO: integrate Stripe Checkout or PromptPay here
    // router.push(`/api/checkout?plan=${planId}&userId=${user.uid}`)
    toast.success(`🚀 กำลังนำไปชำระเงิน (${planId})...`);
  };

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold text-gray-900 dark:text-white">FuelTH Premium</h1>
      </div>

      <div className="px-4 py-4 space-y-5 animate-slide-up">

        {/* Hero */}
        <div
          className="rounded-3xl p-6 text-center text-white"
          style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)' }}
        >
          <div className="text-4xl mb-2">⛽✨</div>
          <h2 className="text-xl font-semibold">อัปเกรดเป็น Premium</h2>
          <p className="text-white/80 text-sm mt-1">
            รับฟีเจอร์ครบครันและแจ้งเตือนแบบเรียลไทม์
          </p>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-card space-y-3">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-brand-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
              <Check size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            </div>
          ))}
        </div>

        {/* Plans */}
        <div className="space-y-3">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => handleUpgrade(plan.id)}
              className="w-full bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-card flex items-center justify-between active:scale-[0.99] transition-transform border-2 border-transparent hover:border-brand-300 dark:hover:border-brand-600"
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{plan.label}</span>
                  {'tag' in plan && (
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {plan.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{plan.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-brand-500">฿{plan.price}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Payment methods */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-400">รับชำระเงินผ่าน</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {['💳 บัตรเครดิต', '📱 PromptPay', '🏦 Mobile Banking'].map(m => (
              <span
                key={m}
                className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-gray-400">
          ยกเลิกได้ทุกเมื่อ · ไม่มีค่าใช้จ่ายซ่อนเร้น
        </p>

        {/* Station owner CTA */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-4 border border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            🏪 เจ้าของปั๊มน้ำมัน?
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            โปรโมตสถานีของคุณให้แสดงผลเด่นชัดบนแผนที่{' '}
            <a
              href="mailto:ads@fuelth.app"
              className="text-brand-500 underline underline-offset-2"
            >
              ads@fuelth.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
