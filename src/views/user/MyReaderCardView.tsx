import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import { AlertTriangle, CalendarClock, CreditCard, Loader2 } from 'lucide-react';
import userApi from '../../services/userApi';
import type { ReaderCard } from '../../types';

const toDate = (value: string) => new Date(value);

const formatDate = (value: string) => {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('vi-VN');
};

const formatCurrency = (value: number) => {
  return `${value.toLocaleString('vi-VN')} VNĐ`;
};

export default function MyReaderCardView() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-reader-card'],
    queryFn: () => userApi.getMyReaderCard(),
    retry: 1,
  });

  const readerCard: ReaderCard | null = data?.data?.result ?? null;

  const isExpired = useMemo(() => {
    if (!readerCard?.ngayHetHan) return false;
    const today = new Date();
    const expireDate = toDate(readerCard.ngayHetHan);
    today.setHours(0, 0, 0, 0);
    expireDate.setHours(0, 0, 0, 0);
    return expireDate < today;
  }, [readerCard?.ngayHetHan]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-lg border border-slate-100 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-3 text-sm font-medium text-slate-600">Đang tải thẻ độc giả...</p>
        </div>
      </div>
    );
  }

  if (isError || !readerCard) {
    const errorMessage = error instanceof Error ? error.message : 'Không thể tải thông tin thẻ độc giả.';
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-lg rounded-2xl border border-red-200 bg-red-50 px-8 py-6 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <p className="text-base font-semibold text-red-900">Không tải được thẻ độc giả</p>
              <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-8 px-4 py-10">
      <div
        className={`relative w-full max-w-3xl overflow-hidden rounded-2xl px-8 py-8 shadow-2xl ring-1 backdrop-blur-sm ${
          isExpired
            ? 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-red-950 ring-zinc-600/50'
            : 'bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-950 ring-indigo-300/30'
        }`}
      >
        <div className="absolute -right-20 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />

        {isExpired && (
          <div className="absolute right-6 top-16 rounded-full border border-red-300/80 bg-red-500/90 px-4 py-1 text-xs font-bold tracking-[0.18em] text-white animate-pulse">
            THE DA HET HAN
          </div>
        )}

        <div className="relative z-10 flex items-start justify-between text-white/95">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100/90">Library One</p>
            <p className="mt-1 text-sm text-cyan-100/80">Smart Reading System</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-100/90">Reader Card</p>
        </div>

        <div className="relative z-10 mt-12">
          <p className="font-mono text-3xl font-bold tracking-[0.22em] text-white drop-shadow-lg md:text-4xl">
            {readerCard.maDocGia}
          </p>
        </div>

        <div className="relative z-10 mt-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/75">Chu the</p>
            <p className="mt-1 text-xl font-semibold text-white">{readerCard.hoTen}</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-slate-200/75">Ngay het han</p>
            <p className={`mt-1 text-base font-semibold ${isExpired ? 'text-red-300' : 'text-cyan-100'}`}>
              {formatDate(readerCard.ngayHetHan)}
            </p>
          </div>

          <div className="rounded-xl bg-white p-2 shadow-lg ring-1 ring-white/30">
            <QRCode value={readerCard.maDocGia} size={92} />
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-600">
              <CreditCard className="h-4 w-4" />
              <p className="text-sm font-medium">Mã độc giả</p>
            </div>
            <p className="mt-2 font-mono text-lg font-semibold text-slate-900">{readerCard.maDocGia}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-600">
              <CalendarClock className="h-4 w-4" />
              <p className="text-sm font-medium">Tình trạng thẻ</p>
            </div>
            <p className={`mt-2 text-lg font-semibold ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
              {isExpired ? 'Đã hết hạn' : 'Còn hiệu lực'}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Tổng nợ thư viện</p>
          <p className={`mt-1 text-2xl font-bold ${readerCard.tongNo > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {formatCurrency(readerCard.tongNo)}
          </p>
        </div>
      </div>
    </div>
  );
}
