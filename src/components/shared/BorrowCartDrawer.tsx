import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { Loader2, X, Trash2, Calendar, DollarSign } from 'lucide-react';
import { useAuthStore, useUIStore } from '../../stores';
import { useCartStore } from '../../stores/useCartStore';
import { lendingApi } from '../../services/lendingApi';

interface BorrowCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BorrowCartDrawer: React.FC<BorrowCartDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { cartItems, removeFromCart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [loadingItems, setLoadingItems] = useState<number[]>([]);

  const cartCount = cartItems.length;
  const isCartEmpty = cartCount === 0;
  const dueDateLabel = useMemo(() => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 4);
    return dueDate.toLocaleDateString('vi-VN');
  }, []);

  const isBorrowing = (maDauSach: number) => loadingItems.includes(maDauSach);

  const setBorrowingState = (maDauSach: number, value: boolean) => {
    setLoadingItems((prev) =>
      value
        ? prev.includes(maDauSach)
          ? prev
          : [...prev, maDauSach]
        : prev.filter((id) => id !== maDauSach)
    );
  };

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as { message?: string } | undefined;
      if (responseData?.message) {
        return responseData.message;
      }
      return error.message || 'Mượn sách thất bại.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Mượn sách thất bại. Vui lòng thử lại.';
  };

  const handleBorrowSingleBook = async (book: (typeof cartItems)[number]) => {
    if (isBorrowing(book.maDauSach)) return;

    if (!book.maCuonSach) {
      addNotification({
        type: 'ERROR',
        message: 'Cuốn sách này hiện không còn bản khả dụng.',
      });
      return;
    }

    const maDocGia = user?.tenDangNhap || localStorage.getItem('maDocGia') || '';

    if (!maDocGia) {
      addNotification({
        type: 'ERROR',
        message: 'Không xác định được mã độc giả. Vui lòng đăng nhập lại.',
      });
      return;
    }

    setBorrowingState(book.maDauSach, true);
    try {
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 4);
      const maNhanVien =
        localStorage.getItem('maNhanVien') ||
        'NV_DEFAULT'; // Fallback nếu không có mã nhân viên

      await lendingApi.phieuMuonTra.create({
        maDocGia,
        maCuonSach: book.maCuonSach,
        maNhanVien,
        ngayMuon: today.toISOString().split('T')[0],
        ngayPhaiTra: dueDate.toISOString().split('T')[0],
      });

      addNotification({
        type: 'SUCCESS',
        message: 'Mượn sách thành công!',
      });

      removeFromCart(book.maDauSach);

      if (useCartStore.getState().cartItems.length === 0) {
        onClose();
      }
    } catch (error) {
      addNotification({
        type: 'ERROR',
        message: getErrorMessage(error),
      });
    } finally {
      setBorrowingState(book.maDauSach, false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer - Slide from right */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white/80 backdrop-blur-2xl border-l border-white/30 shadow-2xl z-50 transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ─── HEADER ─────────────────────────────────────── */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Giỏ sách của bạn</h2>
            <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full font-bold text-xs bg-blue-100 text-blue-700">
              {cartCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/40 text-gray-600 transition-colors"
            aria-label="Đóng giỏ"
          >
            <X size={20} />
          </button>
        </div>

        {/* ─── BODY - Cart Items List ─────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isCartEmpty ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-sm">Giỏ của bạn đang trống</p>
                <p className="text-xs text-gray-400 mt-1">
                  Hãy thêm sách từ kho tài liệu
                </p>
              </div>
            </div>
          ) : (
            cartItems.map((book) => (
              <div
                key={book.maDauSach}
                className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex gap-3">
                  {/* Cover Image */}
                  <div className="flex-shrink-0 w-16 h-20 overflow-hidden rounded-lg bg-gray-200 shadow-sm">
                    {book.anhBiaUrl ? (
                      <img
                        src={book.anhBiaUrl}
                        alt={book.tenDauSach}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-1 text-center text-xs text-gray-400">
                        Không ảnh bìa
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {book.tenDauSach}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-xs text-gray-600">
                          {book.tacGiaList.map((author) => author.tenTacGia).join(', ')}
                        </p>
                        {book.nhaXuatBan && (
                          <p className="mt-1 text-xs text-gray-500">{book.nhaXuatBan}</p>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(book.maDauSach)}
                        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Xóa khỏi giỏ"
                        aria-label={`Xóa ${book.tenDauSach} khỏi giỏ`}
                        disabled={isBorrowing(book.maDauSach)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleBorrowSingleBook(book)}
                        disabled={isBorrowing(book.maDauSach) || !book.maCuonSach}
                        className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                          isBorrowing(book.maDauSach)
                            ? 'cursor-not-allowed bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                            : book.maCuonSach
                              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20'
                              : 'cursor-not-allowed bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isBorrowing(book.maDauSach) ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Đang mượn...
                          </>
                        ) : book.maCuonSach ? (
                          'Mượn ngay'
                        ) : (
                          'Không khả dụng'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ─── DIVIDER ────────────────────────────────────── */}
        <div className="h-px bg-gradient-to-r from-white/0 via-white/30 to-white/0" />

        {/* ─── RULES SECTION ──────────────────────────────── */}
        <div className="p-4 space-y-3">
          {/* Regulations Box */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-900">📋 Quy định mượn sách:</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Mỗi lần bấm <span className="font-semibold text-blue-700">Mượn ngay</span> chỉ tạo phiếu mượn cho đúng 1 cuốn.
            </p>
            
            <div className="flex items-start gap-2">
              <Calendar size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 leading-relaxed">
                <span className="font-semibold">Thời gian mượn tối đa:</span> 4 ngày
              </p>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign size={14} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 leading-relaxed">
                <span className="font-semibold">Phí trả trễ:</span> 1.000đ/ngày
              </p>
            </div>
          </div>

          {/* Summary */}
          {!isCartEmpty && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">Số sách đang chờ:</span> {cartCount}
                </p>
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-red-600 transition-colors hover:text-red-700"
                >
                  Xóa toàn bộ
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Hạn trả: <span className="font-semibold text-indigo-700">
                  {dueDateLabel}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BorrowCartDrawer;
