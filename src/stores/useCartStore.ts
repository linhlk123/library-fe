import { create } from 'zustand';

// Cart Item interface
export interface CartItem {
  maDauSach: number;
  maCuonSach?: number;
  tenDauSach: string;
  anhBiaUrl?: string | null;
  tacGiaList: Array<{ tenTacGia: string }>;
  nhaXuatBan?: string;
}

// Cart Store State
interface CartState {
  cartItems: CartItem[];
  addToCart: (book: CartItem) => { success: boolean; message: string };
  removeFromCart: (maDauSach: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  isBookInCart: (maDauSach: number) => boolean;
  isCartFull: () => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],

  addToCart: (book: CartItem) => {
    const { cartItems } = get();
    
    // Kiểm tra sách đã có trong giỏ
    if (cartItems.some(item => item.maDauSach === book.maDauSach)) {
      return {
        success: false,
        message: 'Sách này đã có trong giỏ rồi!',
      };
    }

    // Thêm sách vào giỏ
    set({ cartItems: [...cartItems, book] });
    return {
      success: true,
      message: `Đã thêm "${book.tenDauSach}" vào giỏ`,
    };
  },

  removeFromCart: (maDauSach: number) => {
    set((state) => ({
      cartItems: state.cartItems.filter(item => item.maDauSach !== maDauSach),
    }));
  },

  clearCart: () => {
    set({ cartItems: [] });
  },

  getCartCount: () => {
    return get().cartItems.length;
  },

  isBookInCart: (maDauSach: number) => {
    return get().cartItems.some(item => item.maDauSach === maDauSach);
  },

  isCartFull: () => {
    return false;
  },
}));
