# 🎨 UI/UX Design System - Mượn Sách

## 📐 Component Layout Reference

### 1️⃣ BorrowCartDrawer - Slide-over Layout

```
┌─────────────────────────────────────────┐
│ ✕  Giỏ sách của bạn        [3/5] 📊    │ ← Header (gradient blue)
├─────────────────────────────────────────┤
│                                         │
│  📖 Sách 1: "React 19"                 │
│  ┌──────────────────────────────────┐  │
│  │ [IMG] Tên: React 19              │  │ ← Book Item
│  │ (80x100)│ Tác: John Doe          │🗑 │   (show on hover)
│  │         │ NXB: Tech Books        │  │
│  └──────────────────────────────────┘  │
│                                         │
│  📖 Sách 2: "TypeScript Mastery"      │
│  ┌──────────────────────────────────┐  │
│  │ [IMG] Tên: TypeScript Mastery    │  │
│  │ (80x100)│ Tác: Jane Smith        │🗑 │
│  │         │ NXB: Web Dev Press     │  │
│  └──────────────────────────────────┘  │
│                                         │
│  📖 Sách 3: "CSS Grid Guide"           │
│  ┌──────────────────────────────────┐  │
│  │ [IMG] Tên: CSS Grid Guide        │  │
│  │ (80x100)│ Tác: Sarah Johnson     │🗑 │
│  │         │ NXB: Design House      │  │
│  └──────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│ 📋 Quy định mượn sách:                 │ ← Rules Box
│ 📅 Thời gian mươn tối đa: 4 ngày      │   (glassmorphism)
│ 💵 Phí trả trễ: 1.000đ / ngày         │
│                                         │
│ Bạn sẽ mượn: 3 cuốn sách              │
│ Hạn trả: 19/04/2026                    │
├─────────────────────────────────────────┤
│ [📤 Gửi yêu cầu mượn]                  │ ← Action Buttons
│ [Xóa tất cả]                           │   (gradient + border)
└─────────────────────────────────────────┘
```

### 2️⃣ BookCard - với "Thêm vào Giỏ"

```
STATE 1: AVAILABLE & NOT IN CART
┌────────────────────────┐
│ [█████] Category       │
│ [Cover Image 44x160]   │
│ [Status: Còn ✓]        │
├────────────────────────┤
│ Tên Sách (2 lines)     │
│ Tác Giả: John Doe      │
│ NXB: 2024              │
│ ────────────────       │
│ [Còn: 2] [Tổng: 5]     │
│ [Giá: 50k] [Kho: 10]   │
│                        │
│ Chi tiết →             │ ← Hover only
├────────────────────────┤
│ [🛒 Thêm vào giỏ]     │ ← Green gradient
└────────────────────────┘

STATE 2: IN CART
┌────────────────────────┐
│ [█████] Category       │
│ [Cover Image 44x160]   │
│ [✓ Đã thêm]            │ ← Blue badge
│ [Status: Còn ✓]        │
├────────────────────────┤
│ ... (same as above)    │
├────────────────────────┤
│ [✓ Đã thêm]            │ ← Disabled, light blue
└────────────────────────┘

STATE 3: CART FULL (5/5)
┌────────────────────────┐
│ [█████] Category       │
│ [Cover Image 44x160]   │ ← opacity-50 (mờ)
│ [Status: Còn ✓]        │
├────────────────────────┤
│ ... (same)             │
├────────────────────────┤
│ [🛒 Thêm vào giỏ]     │ ← DISABLED (grey)
│ 🟠 Giỏ đã full (5/5)  │ ← Warning text
└────────────────────────┘
```

### 3️⃣ ActiveBorrowsView - Book Card (Đang Mượn)

```
STATS SECTION
┌──────────────┬──────────────┬──────────────┐
│ 📚 3 Sách    │ 📖 2 Còn     │ 🚨 1 Quá HSD │
│ Đang Mượn    │ Hạn          │              │
├──────────────┼──────────────┼──────────────┤
│ Xanh 100     │ Vàng 100     │ Đỏ 100       │
└──────────────┴──────────────┴──────────────┘

BORROW CARD - STATE 1: NORMAL (Còn hạn)
┌────────────────────────────────────────────┐
│ [Cover]                                    │
│ (80x100) React Nâng Cao          Còn 2 ngày│
│ │ Tác: John Doe                ✓ In Cart  │
├────────────────────────────────────────────┤
│ Tiến độ mượn: ████████░░░░░░░░░░░░░░░░ 50%│ ← Green bar
│ (0 days overdue)                           │
├────────────────────────────────────────────┤
│ Ngày mượn: 15/04/2026 | Hạn: 19/04/2026  │
├────────────────────────────────────────────┤
│ [Chi tiết] [Gia hạn]                       │
└────────────────────────────────────────────┘

BORROW CARD - STATE 2: ALMOST OVERDUE (Sắp hết)
┌────────────────────────────────────────────┐
│ [Cover]                                    │
│ (80x100) TypeScript Mastery      Còn 1 ngày│
│ │ Tác: Jane Smith              ⚠️ Warning│
├────────────────────────────────────────────┤
│ Tiến độ mượn: ██████████████████░░░░░░░░░░ 80%│ ← Yellow bar
│ (Card background: yellow tint)             │
├────────────────────────────────────────────┤
│ Ngày mượn: 16/04/2026 | Hạn: 20/04/2026  │
├────────────────────────────────────────────┤
│ [Chi tiết] [Gia hạn]                       │
└────────────────────────────────────────────┘

BORROW CARD - STATE 3: OVERDUE (Quá hạn)
┌────────────────────────────────────────────┐
│ [Cover]                                    │
│ (80x100) CSS Grid Guide          🚨 Trễ 2│
│ │ Tác: Sarah Johnson    Phạt: 2.000đ      │
│ │                       (animate pulse)   │
├────────────────────────────────────────────┤
│ Tiến độ mượn: ████████████████████████████ 125%│ ← Red bar
│ (Card background: red tint)                │
├────────────────────────────────────────────┤
│ 💰 Phạt trễ: 2.000đ                       │ ← Red text
├────────────────────────────────────────────┤
│ Ngày mượn: 14/04/2026 | Hạn: 18/04/2026  │
├────────────────────────────────────────────┤
│ [Trả sách ngay]                            │ ← Red button
└────────────────────────────────────────────┘

OVERDUE WARNING - Top Section
┌────────────────────────────────────────────┐
│ 🚨 Cảnh báo: Sách quá hạn!                 │ ← Red background
│                                            │
│ Bạn có 1 cuốn sách đã quá hạn trả.        │
│ Tổng phạt: 5.000đ                         │
│                                            │
│ [Trả sách ngay]                            │
└────────────────────────────────────────────┘
```

### 4️⃣ Catalog Header - with Cart Button

```
┌─────────────────────────────────────────────────────────┐
│ 📚 Khám phá Kho Sách         [🛒 Giỏ sách] [3]        │
│ Tìm kiếm & khám phá những cuốn sách yêu thích            │
└─────────────────────────────────────────────────────────┘

[Search box with icon]

[✨ Tất cả] [Kỹ Thuật] [Văn Học] [Lịch Sử] [Triết Học]
```

---

## 🎨 Color Palette

| Component | Color | RGB | Tailwind |
|-----------|-------|-----|----------|
| Primary Button | Blue | 59, 130, 246 | `from-blue-600 to-indigo-600` |
| Success | Green | 34, 197, 94 | `bg-green-100 text-green-800` |
| Warning | Orange | 251, 146, 60 | `bg-orange-100 text-orange-600` |
| Danger | Red | 239, 68, 68 | `bg-red-100 text-red-800` |
| Overdue Badge | Red | - | `bg-red-500 text-white animate-pulse` |
| Rules Box | Blue | - | `from-blue-50 to-cyan-50` |
| Glassmorphism | White/Blue | - | `bg-white/80 backdrop-blur-2xl` |

---

## 📊 Progress Bar Colors

```
✅ Normal (0-80%): Green
🟡 Warning (80-100%): Yellow to Orange
🔴 Overdue (100%+): Red + Animate Pulse
```

---

## 🎯 Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Drawer Title | sm (14px) | bold | gray-900 |
| Book Title | sm (14px) | bold | gray-900 |
| Author | xs (12px) | normal | gray-600 |
| Badge | xs (12px) | bold | varies |
| Button | sm (14px) | semibold | white |

---

## 📱 Responsive Breakpoints

```
Mobile (< 640px):
- Drawer: Full width - 16px padding
- Grid: 1 column
- Font: Slightly smaller

Tablet (640px - 1024px):
- Grid: 2 columns (sm:)
- Drawer: 28rem width

Desktop (1024px+):
- Grid: 3 columns (lg:), 4 columns (xl:)
- Drawer: max-w-md
```

---

## 🎬 Animations

```css
/* Pulse - Overdue badge */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Scale - Button hover */
.hover:scale-[1.02] {
  on hover: scale 102%
}

/* Slide - Drawer entry */
.translate-x-0 (open) → .translate-x-full (closed)
transition-transform duration-300 ease-out

/* Backdrop - Overlay */
backdrop-blur-xs (light)
backdrop-blur-2xl (drawer)
```

---

## 🔲 Component Dimensions

| Component | Width | Height | Notes |
|-----------|-------|--------|-------|
| BookCard Cover | 100% | 44 (176px) | Responsive |
| Book Thumbnail (drawer) | 64px | 80px | Fixed |
| Cart Drawer | 100% max-w-md | 100vh | Full height |
| Progress Bar | 100% | h-2 | Rounded full |
| Button | 100% | 40px (py-2.5) | Responsive |

---

## 💡 Glassmorphism Effect

```html
<!-- Drawer -->
bg-white/80 backdrop-blur-2xl border-l border-white/30 shadow-2xl

<!-- Header gradient -->
bg-gradient-to-r from-blue-50/50 to-indigo-50/50

<!-- Subtle divider -->
border-white/20
bg-white/40
```

---

## ✨ Interactive States

### Button States

```
ENABLED:
bg-blue-600 text-white hover:scale-[1.02] hover:shadow-lg

DISABLED:
bg-gray-100 text-gray-400 cursor-not-allowed

ACTIVE/SELECTED:
bg-blue-100 text-blue-700 border-blue-300
```

### Card States

```
NORMAL:
border-gray-100 shadow-sm

HOVER:
shadow-lg -translate-y-0.5 (lift effect)

DISABLED:
opacity-60 cursor-not-allowed
```

---

## 📖 Example - Full User Flow

```
1. User opens Catalog
   ↓
2. Clicks "Thêm vào giỏ" on Book A
   ↓ [Toast: "Đã thêm React 19 vào giỏ"]
   ↓
3. Button changes to "✓ Đã thêm" (disabled)
4. Cart button badge: [1]
   ↓
5. Add Book B, C, D, E (5 cuốn total)
   ↓ [Badge: 5/5] [Turn orange]
   ↓
6. Try to add Book F
   ↓ [All other books' buttons → opacity-50]
   ↓ [Toast: "Tối đa 5 cuốn..."]
   ↓
7. Click Cart button
   ↓ [Drawer slides in from right]
   ↓
8. Review books + Rules
   ↓
9. Click "Gửi yêu cầu mượn"
   ↓ [Loading state]
   ↓ [Success Toast: "Yêu cầu được gửi!"]
   ↓ [Drawer closes, cart clears]
   ↓
10. Navigate to "Sách Đang Mượn" page
    ↓
11. See Active Borrows with Progress Bars
    ↓
12. Days pass... when overdue:
    ↓ [Progress bar → Red]
    ↓ [Badge: 🚨 Trễ 2 ngày - Phạt 2.000đ (pulse)]
    ↓ [Warning Box at top]
    ↓ [Button: "Trả sách ngay"]
```

---

**✅ Design System Ready! All components are pixel-perfect & accessible.**
