# 📚 Hướng Dẫn Tích Hợp Hệ Thống Mượn Sách

## 📋 Tổng Quát

Tôi đã tạo ra một hệ thống hoàn chỉnh cho luồng **Mượn Sách** trong phân hệ USER (Độc giả) với:
- ✅ State Management (Zustand)
- ✅ Giỏ Mượn Sách (Slide-over Drawer)
- ✅ Danh sách Sách Đang Mượn
- ✅ UI/UX hiện đại với Tailwind CSS

---

## 📦 Các File Được Tạo/Cập Nhật

### 1. **useCartStore.ts** (Store Zustand)
📍 **Đường dẫn:** `src/stores/useCartStore.ts`

**Chức năng:**
- Quản lý giỏ sách với giới hạn tối đa 5 cuốn
- Logic `addToCart()` với validation
- Remove, clear, và kiểm tra trạng thái giỏ

**Key Features:**
```typescript
- addToCart(book): Thêm sách, kiểm tra trùng lặp & limit
- removeFromCart(maDauSach): Xóa sách khỏi giỏ
- clearCart(): Xóa tất cả
- isCartFull(): Kiểm tra giỏ đã full?
- isBookInCart(maDauSach): Kiểm tra sách có trong giỏ?
```

---

### 2. **BorrowCartDrawer.tsx** (Component Giỏ Sách)
📍 **Đường dẫn:** `src/components/shared/BorrowCartDrawer.tsx`

**Thiết kế & Tính năng:**

#### 🎨 Header
- Tiêu đề: "Giỏ sách của bạn"
- Badge động hiển thị: `3/5 cuốn`
- Badge chuyển sang **cam cảnh báo** khi đạt 5/5

#### 📖 Body - Danh Sách Sách
Mỗi item hiển thị:
- Ảnh bìa sách (thumbnail 80x100px)
- Tên sách + Tác giả
- Nhà xuất bản
- Nút xóa (icon Trash) - hiện khi hover

#### ⚠️ Khu Vực Cảnh Báo Luật Chơi
Hộp thông tin với:
- Glassmorphism style (bg-blue-50, border-blue-100)
- **Icon Lịch (Calendar):** "Thời gian mượn tối đa: 4 ngày"
- **Icon Tiền (DollarSign):** "Phí trả trễ: 1.000đ / ngày"

#### 🔘 Action Buttons
- **"Gửi yêu cầu mượn"** - Gradient xanh, loading state
- Nút này **DISABLED** khi giỏ trống
- **"Xóa tất cả"** - Hiện khi giỏ có sách

---

### 3. **CatalogViewWithCart.tsx** (Catalog + Cart Integration)
📍 **Đường dẫn:** `src/views/user/CatalogViewWithCart.tsx`

**Cập nhật từ CatalogView gốc:**

#### 📍 Nút Giỏ Sách Floating
- Header phải: Button "Giỏ sách"
- Badge số lượng động (0-5)
- Click mở drawer

#### 🎯 BookCard Component Nâng Cấp
Mỗi thẻ sách có:

```
┌─────────────────────────┐
│  [Cover Image]          │
│  Category Badge (top-left)
│  Status Badge (bottom-left)  
│  ✓ Đã thêm Badge (khi trong giỏ)
├─────────────────────────┤
│ Title                   │
│ Author                  │
│ Publisher / Year        │
│ [Available] [Total]     │
│ [Price] [Inventory]     │
├─────────────────────────┤
│ [Thêm vào giỏ] Button   │
│ 🟠 Giỏ đã full (5/5)    │
└─────────────────────────┘
```

#### 🔘 Nút "Thêm vào Giỏ"
**3 Trạng thái:**
1. **Bình thường** (xanh gradient)
   - Text: "🛒 Thêm vào giỏ"
   - Click: Thêm sách, show Toast

2. **Đã Thêm** (xanh nhạt)
   - Text: "✓ Đã thêm"
   - Disabled, không click lại

3. **Giỏ Full (5/5)** (xám mờ)
   - Tất cả nút "Thêm vào giỏ" khác bị **opacity-50**
   - Cursor: not-allowed
   - Warning text: "Giỏ đã full (5/5)"

---

### 4. **ActiveBorrowsView.tsx** (Theo Dõi Sách Đang Mượn)
📍 **Đường dẫn:** `src/views/user/ActiveBorrowsView.tsx`

**Layout & UI:**

#### 📊 Header Stats
```
┌──────────┬──────────┬──────────┐
│ 3 Sách   │ 2 Còn    │ 1 Quá HSD│
│ Đang MN  │ Hạn      │          │
└──────────┴──────────┴──────────┘
```

#### 🚨 Warning Section (Nếu Có Quá Hạn)
```
┌─ Cảnh báo: Sách quá hạn! ──┐
│ 🔴 Bạn có 1 cuốn quá hạn   │
│ 💰 Tổng phạt: 5.000đ       │
│ [Trả sách ngay]             │
└──────────────────────────────┘
```

#### 📖 Book Card (Mỗi Cuốn Sách Đang Mượn)

**Thiết kế Ngang:**
```
┌──────────────────────────────────────┐
│ [80x100]  | Tên Sách                │
│  Cover    | Tác Giả                 │
│           | Status Badge (Còn/Trễ)  │
├──────────────────────────────────────┤
│ Tiến độ mượn: ████░░ 65%            │
│ (Progress Bar xanh/vàng/đỏ)         │
├──────────────────────────────────────┤
│ Phạt trễ: 0đ (nếu quá hạn)          │
├──────────────────────────────────────┤
│ Ngày mượn: 15/04/2026 | Hạn: 19/04  │
├──────────────────────────────────────┤
│ [Chi tiết] [Gia hạn]  (hoặc)        │
│ [Trả sách ngay] (nếu quá hạn)       │
└──────────────────────────────────────┘
```

#### 🎨 Progress Bar Màu
- **Xanh** (✓ Còn hạn): 0-80%
- **Vàng** (⚠️ Sắp hết): 80-100%
- **Đỏ nhấp nháy** (🚨 Quá hạn): Animate pulse

#### 📛 Overdue Badge
```
Nếu quá hạn:
🚨 Trễ 2 ngày | Phạt: 2.000đ (animate pulse)
```

#### 📋 Quy Định (Footer)
```
📋 Quy định mượn sách:
• Thời gian mượn tối đa: 4 ngày
• Phí trả trễ: 1.000đ/ngày
• Tối đa có thể mượn: 5 cuốn cùng lúc
```

---

## 🔧 Cách Tích Hợp

### Step 1: Export Store từ index.ts
📍 `src/stores/index.ts`

```typescript
// Thêm dòng này
export { useCartStore } from './useCartStore';
```

### Step 2: Cập nhật Routes (tùy chọn)
Nếu bạn muốn dùng `CatalogViewWithCart` thay `CatalogView`:

📍 `src/App.tsx` (hoặc router config)

```typescript
// Đổi từ
import CatalogView from './views/user/CatalogView';

// Thành
import CatalogViewWithCart from './views/user/CatalogViewWithCart';

// Hoặc thêm route mới
<Route path="/catalog-new" element={<CatalogViewWithCart />} />
```

### Step 3: Sử dụng BorrowCartDrawer (nếu muốn integrateWithCustomUI)

```typescript
import BorrowCartDrawer from '@/components/shared/BorrowCartDrawer';
import { useCartStore } from '@/stores/useCartStore';

export function MyCustomCatalog() {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useCartStore(state => state.cartItems);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Giỏ sách ({cartItems.length}/5)
      </button>

      <BorrowCartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={() => {
          // TODO: Call API
          console.log('Submit borrow request');
        }}
      />
    </>
  );
}
```

### Step 4: Sử dụng ActiveBorrowsView

```typescript
import ActiveBorrowsView from '@/views/user/ActiveBorrowsView';

export function MyBorrowingsPage() {
  // Mock data (thay bằng API call)
  const mockBorrows = [
    {
      maCuonSach: 1,
      tenDauSach: 'React Nâng cao',
      tacGia: 'Tác giả A',
      ngayMuon: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      ngayHetHan: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      soNgayMuon: 4,
      // ...
    },
  ];

  return <ActiveBorrowsView borrows={mockBorrows} isLoading={false} />;
}
```

---

## 🎯 Chức Năng Chi Tiết

### UseCartStore API

```typescript
import { useCartStore } from '@/stores/useCartStore';

const {
  cartItems,        // CartItem[]
  addToCart,        // (book: CartItem) => { success, message }
  removeFromCart,   // (maDauSach) => void
  clearCart,        // () => void
  getCartCount,     // () => number
  isBookInCart,     // (maDauSach) => boolean
  isCartFull,       // () => boolean
} = useCartStore();

// Ví dụ
const result = addToCart({
  maDauSach: 1,
  tenDauSach: 'React 19',
  tacGiaList: [{ maTacGia: 1, tenTacGia: 'John' }],
  nhaXuatBan: 'TechBooks',
});

if (!result.success) {
  showErrorToast(result.message); // "Tối đa 5 cuốn..."
}
```

---

## 🎨 Tailwind CSS Classes Used

**Glassmorphism:**
```
bg-white/80 backdrop-blur-2xl border-white/30
```

**Gradient:**
```
bg-gradient-to-r from-blue-600 to-indigo-600
bg-gradient-to-br from-red-50 to-orange-50
```

**Animation:**
```
animate-pulse (Quá hạn badge)
hover:scale-105
transition-all duration-300
```

---

## ✅ Quy Định Được Hiển Thị

| Quy Định | Hiển Thị Ở | Chi Tiết |
|----------|-----------|---------|
| **Max 5 cuốn** | Giỏ Sách + BookCard | Badge cảnh báo, nút disabled |
| **4 ngày mượn** | Giỏ Sách + Mượn Sách | Calendar icon, hạn trả |
| **Phạt 1.000đ/ngày** | Giỏ Sách + Quá Hạn Badge | DollarSign icon |

---

## 🚀 Next Steps (TODO)

1. **API Integration:**
   - POST `/api/borrows` - Submit mượn sách
   - GET `/api/borrows/active` - Danh sách đang mượn
   - POST `/api/borrows/{id}/return` - Trả sách

2. **Error Handling:**
   - Backend validation
   - Retry logic
   - Error toast messages

3. **Confirmation Dialog:**
   - ConfirmDialog trước khi gửi yêu cầu
   - Thêm terms & conditions

4. **Analytics:**
   - Tracking user borrow patterns
   - Popular books

---

## 📱 Responsive Design

✅ **Mobile First:**
- Drawer full width on mobile
- Grid 2 columns on tablet (md:)
- Grid 3-4 columns on desktop (lg:, xl:)
- Touch-friendly buttons (py-2.5, px-4)

---

## 🎭 Component Hierarchy

```
CatalogViewWithCart
├── Search + Filter
├── BookCard (x N)
│  └── Button "Thêm vào giỏ"
│      └── useCartStore.addToCart()
├── BorrowCartDrawer
│  ├── Header (Badge 3/5)
│  ├── CartItems List
│  ├── Rules Box
│  └── Action Buttons
└── Toast (Success/Error)

UserDashboard
├── ActiveBorrowsView
│  ├── Stats Cards
│  ├── Overdue Warning
│  └── BorrowCard (x N)
│     ├── Progress Bar
│     ├── Overdue Badge (if needed)
│     └── Action Buttons
```

---

## 💡 Tips & Best Practices

1. **State Management:**
   - Zustand store persist khi reload page (optional)
   - Clear cart sau khi submit thành công

2. **UX:**
   - Auto-open cart drawer khi add sách đầu tiên (tuỳ chọn)
   - Confirm dialog trước gửi yêu cầu
   - Sound notification (optional)

3. **Performance:**
   - Memoize filtered books list
   - Lazy load cart drawer
   - Optimize image loading

4. **Accessibility:**
   - ARIA labels on buttons
   - Keyboard navigation (Tab, Enter)
   - Screen reader support

---

**🎉 Hệ thống Mượn Sách đã sẵn sàng tích hợp!**
