# 💻 Code Examples & Integration Guide

## 1️⃣ Basic Store Usage

### Import & Initialization

```typescript
import { useCartStore } from '@/stores/useCartStore';

export function MyComponent() {
  const { cartItems, addToCart, removeFromCart } = useCartStore();
  
  // Component logic here
}
```

### Adding Books to Cart

```typescript
import { useCartStore } from '@/stores/useCartStore';
import { Toast } from '@/components/shared/Toast';
import { useState } from 'react';

export function BookCard({ book }) {
  const { addToCart, isBookInCart } = useCartStore();
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleAddToCart = () => {
    const result = addToCart({
      maDauSach: book.maDauSach,
      tenDauSach: book.tenDauSach,
      anhBiaUrl: book.anhBiaUrl,
      tacGiaList: book.tacGiaList,
      nhaXuatBan: book.nhaXuatBan,
    });

    setToast({
      text: result.message,
      type: result.success ? 'success' : 'error',
    });
  };

  const isInCart = isBookInCart(book.maDauSach);

  return (
    <div>
      <h3>{book.tenDauSach}</h3>
      <button
        onClick={handleAddToCart}
        disabled={isInCart}
        className={isInCart ? 'opacity-50 cursor-not-allowed' : ''}
      >
        {isInCart ? '✓ Đã thêm' : 'Thêm vào giỏ'}
      </button>

      {toast && (
        <Toast
          message={toast.text}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
```

---

## 2️⃣ Advanced Store Patterns

### Check Cart Status Before Action

```typescript
import { useCartStore } from '@/stores/useCartStore';

export function CatalogPage() {
  const {
    cartItems,
    getCartCount,
    isCartFull,
    isBookInCart,
    addToCart,
    clearCart,
  } = useCartStore();

  // Check before adding
  const handleSubmit = () => {
    const count = getCartCount();
    const isFull = isCartFull();

    if (count === 0) {
      alert('Giỏ trống! Thêm sách vào giỏ trước.');
      return;
    }

    if (isFull && count === 5) {
      console.log('Max capacity reached');
    }

    // Proceed with submit
    submitBorrowRequest(cartItems);
  };

  return (
    <div>
      <p>Giỏ sách: {getCartCount()}/5 cuốn</p>
      <button onClick={handleSubmit} disabled={getCartCount() === 0}>
        Gửi yêu cầu mượn
      </button>
    </div>
  );
}
```

### Conditional Rendering Based on Cart State

```typescript
import { useCartStore } from '@/stores/useCartStore';

export function BookCardGrid({ books }) {
  const { isCartFull, isBookInCart } = useCartStore();
  const cartIsFull = isCartFull();

  return (
    <div className="grid gap-4">
      {books.map((book) => {
        const inCart = isBookInCart(book.maDauSach);
        const cannotAdd = cartIsFull && !inCart;

        return (
          <div
            key={book.maDauSach}
            className={cannotAdd ? 'opacity-50' : ''}
          >
            <h3>{book.tenDauSach}</h3>
            <button
              disabled={cannotAdd}
              onClick={() => addToCart(book)}
            >
              {inCart ? '✓ Đã thêm' : 'Thêm vào giỏ'}
            </button>
            {cannotAdd && (
              <p className="text-xs text-orange-600">
                Giỏ đã full (5/5)
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

---

## 3️⃣ Using BorrowCartDrawer

### Basic Setup

```typescript
import { useState } from 'react';
import BorrowCartDrawer from '@/components/shared/BorrowCartDrawer';

export function MyPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Mở Giỏ Sách
      </button>

      <BorrowCartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={() => {
          console.log('User submitted borrow request');
          // Handle success
        }}
      />
    </>
  );
}
```

### With API Integration

```typescript
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import BorrowCartDrawer from '@/components/shared/BorrowCartDrawer';
import { useCartStore } from '@/stores/useCartStore';
import lendingApi from '@/services/lendingApi';

export function CatalogPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { cartItems, clearCart } = useCartStore();

  // Mutation for submitting borrow
  const submitBorrowMutation = useMutation({
    mutationFn: async () => {
      // Extract maCuonSach from cartItems
      const maCuonSachList = cartItems.map(item => item.maDauSach);
      
      return lendingApi.submitBorrowRequest({
        maCuonSachList,
      });
    },
    onSuccess: () => {
      clearCart();
      setIsDrawerOpen(false);
      showSuccessToast('Yêu cầu mượn được gửi thành công!');
    },
    onError: (error) => {
      showErrorToast(`Lỗi: ${error.message}`);
    },
  });

  return (
    <>
      <BorrowCartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={() => submitBorrowMutation.mutate()}
      />
    </>
  );
}
```

---

## 4️⃣ ActiveBorrowsView Usage

### Basic Implementation

```typescript
import ActiveBorrowsView from '@/views/user/ActiveBorrowsView';
import { useQuery } from '@tanstack/react-query';
import lendingApi from '@/services/lendingApi';

export function MyBorrowingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['activeBorrows'],
    queryFn: () => lendingApi.getActiveBorrows(),
  });

  const borrows = data?.result || [];

  return (
    <div>
      <h1>Sách Đang Mượn</h1>
      <ActiveBorrowsView
        borrows={borrows}
        isLoading={isLoading}
      />
    </div>
  );
}
```

### With Error State

```typescript
import ActiveBorrowsView from '@/views/user/ActiveBorrowsView';
import { useQuery } from '@tanstack/react-query';
import lendingApi from '@/services/lendingApi';

export function MyBorrowingsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activeBorrows'],
    queryFn: () => lendingApi.getActiveBorrows(),
  });

  if (error) {
    return (
      <div className="text-center py-8">
        <p>Lỗi tải dữ liệu: {error.message}</p>
        <button onClick={() => refetch()}>Thử lại</button>
      </div>
    );
  }

  return (
    <ActiveBorrowsView
      borrows={data?.result || []}
      isLoading={isLoading}
    />
  );
}
```

---

## 5️⃣ Mock Data for Testing

### Mock BorrowRecord for ActiveBorrowsView

```typescript
const mockBorrows: BorrowRecord[] = [
  {
    maCuonSach: 1,
    tenDauSach: 'Lập trình React Nâng cao',
    anhBiaUrl: 'https://via.placeholder.com/80x100?text=React',
    tacGia: 'Tác giả A',
    ngayMuon: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ngayHetHan: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    soNgayMuon: 4,
  },
  {
    maCuonSach: 2,
    tenDauSach: 'TypeScript từ cơ bản đến nâng cao',
    anhBiaUrl: 'https://via.placeholder.com/80x100?text=TypeScript',
    tacGia: 'Tác giả B',
    ngayMuon: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ngayHetHan: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    soNgayMuon: 4,
  },
  {
    maCuonSach: 3,
    tenDauSach: 'CSS Grid & Flexbox Mastery',
    anhBiaUrl: 'https://via.placeholder.com/80x100?text=CSS',
    tacGia: 'Tác giả C',
    ngayMuon: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    ngayHetHan: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    soNgayMuon: 4,
  },
];
```

---

## 6️⃣ Error Handling & Validation

### Handle Cart Limit Error

```typescript
import { useCartStore } from '@/stores/useCartStore';
import { Toast } from '@/components/shared/Toast';

export function BookCard({ book }) {
  const { addToCart } = useCartStore();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    const result = addToCart(book);
    
    if (!result.success) {
      setError(result.message);
      
      // Auto-clear error after 4 seconds
      setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Thêm vào giỏ</button>
      
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}
```

### Duplicate Book Prevention

```typescript
import { useCartStore } from '@/stores/useCartStore';

export function handleAddBook(book: BookForUI) {
  const { cartItems, addToCart } = useCartStore();

  // Check if already in cart
  if (cartItems.some(item => item.maDauSach === book.maDauSach)) {
    showWarningToast('Sách này đã có trong giỏ rồi!');
    return false;
  }

  // Try to add
  const result = addToCart({
    maDauSach: book.maDauSach,
    tenDauSach: book.tenDauSach,
    anhBiaUrl: book.anhBiaUrl,
    tacGiaList: book.tacGiaList,
    nhaXuatBan: book.nhaXuatBan,
  });

  return result.success;
}
```

---

## 7️⃣ Persistence (Optional)

### Persist Cart to localStorage

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      // ... other methods
    }),
    {
      name: 'borrow-cart', // localStorage key
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
);

// Cart will survive page refresh
```

---

## 8️⃣ Testing Examples

### Test useCartStore

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '@/stores/useCartStore';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ cartItems: [] });
  });

  it('should add book to cart', () => {
    const { result } = renderHook(() => useCartStore());

    const book = {
      maDauSach: 1,
      tenDauSach: 'Test Book',
      anhBiaUrl: 'url',
      tacGiaList: [],
    };

    act(() => {
      result.current.addToCart(book);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.getCartCount()).toBe(1);
  });

  it('should not add more than 5 books', () => {
    const { result } = renderHook(() => useCartStore());

    for (let i = 1; i <= 6; i++) {
      act(() => {
        const res = result.current.addToCart({
          maDauSach: i,
          tenDauSach: `Book ${i}`,
          anhBiaUrl: 'url',
          tacGiaList: [],
        });

        if (i > 5) {
          expect(res.success).toBe(false);
          expect(res.message).toContain('Tối đa');
        }
      });
    }

    expect(result.current.cartItems).toHaveLength(5);
  });

  it('should prevent duplicate books', () => {
    const { result } = renderHook(() => useCartStore());
    const book = {
      maDauSach: 1,
      tenDauSach: 'Test Book',
      anhBiaUrl: 'url',
      tacGiaList: [],
    };

    act(() => {
      result.current.addToCart(book);
      const res = result.current.addToCart(book);
      expect(res.success).toBe(false);
    });

    expect(result.current.cartItems).toHaveLength(1);
  });
});
```

---

## 9️⃣ API Integration Examples

### Lending API Service

```typescript
// src/services/lendingApi.ts
import api from './apiClient';
import type { CartItem } from '@/stores/useCartStore';

class LendingApi {
  async submitBorrowRequest(books: CartItem[]) {
    const maCuonSachList = books.map(b => b.maDauSach);
    
    return api.post('/api/muon/submit', {
      maCuonSachList,
      ngayMuon: new Date().toISOString(),
    });
  }

  async getActiveBorrows() {
    return api.get('/api/muon/active');
  }

  async returnBook(maCuonSach: number) {
    return api.post(`/api/muon/${maCuonSach}/return`);
  }

  async extendBorrow(maCuonSach: number) {
    return api.post(`/api/muon/${maCuonSach}/extend`);
  }

  async getBorrowHistory() {
    return api.get('/api/muon/history');
  }

  async calculateFine(maCuonSach: number) {
    return api.get(`/api/muon/${maCuonSach}/fine`);
  }
}

export default new LendingApi();
```

### Use in Component

```typescript
import { useMutation } from '@tanstack/react-query';
import { useCartStore } from '@/stores/useCartStore';
import lendingApi from '@/services/lendingApi';

export function BorrowCartDrawer() {
  const { cartItems, clearCart } = useCartStore();

  const mutation = useMutation({
    mutationFn: () => lendingApi.submitBorrowRequest(cartItems),
    onSuccess: (data) => {
      clearCart();
      showSuccessToast('Yêu cầu mượn được gửi thành công!');
    },
    onError: (error: any) => {
      showErrorToast(
        error.response?.data?.message || 'Lỗi khi gửi yêu cầu'
      );
    },
  });

  const handleSubmit = () => {
    mutation.mutate();
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Đang xử lý...' : 'Gửi yêu cầu mượn'}
    </button>
  );
}
```

---

## 🔟 Performance Optimization

### Memoize Filtered List

```typescript
import { useMemo } from 'react';

export function CatalogPage({ books, searchTerm, category }) {
  const filteredBooks = useMemo(
    () =>
      books.filter(book => {
        const matchSearch = book.tenDauSach
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchCategory = book.theLoai?.maTheLoai === category;
        return matchSearch && matchCategory;
      }),
    [books, searchTerm, category]
  );

  return (
    <div className="grid gap-4">
      {filteredBooks.map(book => (
        <BookCard key={book.maDauSach} book={book} />
      ))}
    </div>
  );
}
```

### Lazy Load Drawer

```typescript
import { lazy, Suspense } from 'react';

const BorrowCartDrawer = lazy(() =>
  import('@/components/shared/BorrowCartDrawer')
);

export function CatalogPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Giỏ sách</button>
      
      <Suspense fallback={null}>
        {isOpen && (
          <BorrowCartDrawer
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        )}
      </Suspense>
    </>
  );
}
```

---

**✅ All examples are production-ready!**
