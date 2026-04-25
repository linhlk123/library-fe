# Hệ thống Phân quyền STAFF - Tài liệu Hướng dẫn

## Tổng quan

Hệ thống phân quyền đã được triển khai để đảm bảo rằng **STAFF role có full quyền truy cập tất cả các trang (pages)**. Đây là hệ thống kiểm soát quyền truy cập dựa trên vai trò (Role-Based Access Control - RBAC).

## Cấu trúc thư mục mới

```
src/
├── utils/
│   └── permissions.ts          # ← Tập tin mới: Định nghĩa quyền cho mỗi role
```

## Các tập tin đã được sửa đổi

### 1. **src/utils/permissions.ts** (Tập tin mới)
File này định nghĩa:
- `rolePermissions`: Bảng ánh xạ vai trò → danh sách views/pages được phép truy cập
- `hasPermission()`: Kiểm tra xem role có quyền truy cập view cụ thể
- `getAccessibleViews()`: Lấy danh sách tất cả views mà role có thể truy cập
- `hasStaffFullAccess()`: Kiểm tra xem STAFF có full access tới tất cả pages

### 2. **src/hooks/useRole.ts** (Cập nhật)
Thêm các methods mới:
```typescript
canAccessView(view: ViewState): boolean     // Kiểm tra quyền truy cập một trang cụ thể
hasStaffFullAccess(): boolean               // Kiểm tra STAFF có full access
getAccessibleViews(): ViewState[]           // Lấy danh sách trang có thể truy cập
```

### 3. **src/components/Layout/Sidebar.tsx** (Cập nhật)
- Thêm `useRole` hook để lấy quyền hiện tại
- Lọc menu items dựa trên quyền: chỉ hiển thị các trang mà user có quyền truy cập
- Chỉ cho phép navigate tới các trang được phép

### 4. **src/App.tsx** (Cập nhật)
- Thêm kiểm tra quyền khi render từng view
- Ngăn chặn truy cập unauthorized bằng cách:
  - Chỉ render view nếu user có quyền
  - Tự động chuyển hướng tới view đầu tiên nếu view hiện tại không được phép

## Quyền cho mỗi Role

### STAFF Role - Có Full Access
STAFF có quyền truy cập **TẤT CẢ** các trang:
- ✅ Lập thẻ độc giả (READER_CARD)
- ✅ Nhập danh sách loại độc giả (READER_TYPES)
- ✅ Tiếp nhận sách mới (NEW_BOOK)
- ✅ Nhập danh sách thể loại (CATEGORIES)
- ✅ Nhập danh sách tác giả (AUTHORS)
- ✅ Tra cứu sách (CATALOG)
- ✅ Lập phiếu mượn/trả sách (BORROW_RETURN)
- ✅ Lập phiếu thu tiền phạt (FINE_RECEIPT)
- ✅ Lập báo cáo (REPORTS)
- ✅ Thay đổi quy định (REGULATIONS)
- ✅ Phân quyền người dùng (USER_ROLES)
- ✅ Tạo tài khoản user (USER_ACCOUNTS)

### USER Role
USER **KHÔNG** có quyền truy cập bất kỳ trang admin nào (pages folder). USER chỉ có:
- Dashboard riêng
- Tra cứu sách
- Xem mượn của tôi
- Lịch sử mượn
- Hồ sơ cá nhân

## Cách sử dụng

### Kiểm tra quyền trong components:
```typescript
import { useRole } from '../hooks/useRole';

function MyComponent() {
  const { canAccessView, isStaff } = useRole();

  // Kiểm tra quyền truy cập một trang
  if (!canAccessView('USER_ROLES')) {
    return <div>Bạn không có quyền truy cập trang này</div>;
  }

  return <div>Nội dung trang</div>;
}
```

### Mở rộng quyền (nếu cần thêm roles khác):
Chỉnh sửa `src/utils/permissions.ts`:
```typescript
export const rolePermissions: Record<TenVaiTro, ViewState[]> = {
  'STAFF': [...],      // Full access (hiện tại)
  'USER': [],          // No access
  'ADMIN': [...],      // Thêm role mới nếu cần
};
```

## Kiểm tra kết quả

### Trước khi đăng nhập với tài khoản STAFF:
1. Tất cả 12 mục menu sẽ **hiển thị** ở sidebar
2. Có thể nhấp vào bất kỳ mục nào mà **không gặp lỗi**
3. Mỗi page sẽ render bình thường

### Trước khi đăng nhập với tài khoản USER:
1. Chỉ thấy giao diện user (Dashboard, Catalog, etc.)
2. **Không thấy** sidebar với menu pages
3. **Không thể** truy cập bất kỳ trang admin nào

## Tóm tắt

✅ **STAFF role hiện có full quyền truy cập tất cả 12 trang trong folder `pages`**

Hệ thống phân quyền đã được:
- ✅ Triển khai trong `utils/permissions.ts`
- ✅ Tích hợp vào `useRole` hook
- ✅ Áp dụng trong Sidebar (lọc menu)
- ✅ Áp dụng trong App.tsx (kiểm tra khi render)
- ✅ Bảo vệ chống truy cập unauthorized
