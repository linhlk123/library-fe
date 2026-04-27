import {
  BookOpen,
  IdCard,
  Users,
  BookPlus,
  Shapes,
  Pencil,
  ClipboardList,
  Receipt,
  ChartColumn,
  SlidersHorizontal,
  Shield,
  UserPlus,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import type { ViewState } from '../../App';

export const navItems: Array<{
  id: ViewState;
  label: string;
  icon: typeof BookOpen;
}> = [
  { id: 'READER_CARD', label: 'Lập thẻ độc giả', icon: IdCard },
  {
    id: 'READER_TYPES',
    label: 'Loại độc giả',
    icon: Users,
  },
  { id: 'NEW_BOOK', label: 'Tiếp nhận sách mới', icon: BookPlus },
  { id: 'CATEGORIES', label: 'Thể loại sách', icon: Shapes },
  { id: 'AUTHORS', label: 'Tác giả', icon: Pencil },
  { id: 'CATALOG', label: 'Kho sách', icon: BookOpen },
  {
    id: 'BORROW_RETURN',
    label: 'Phiếu mượn/trả',
    icon: ClipboardList,
  },
  {
    id: 'FINE_RECEIPT',
    label: 'Phiếu thu tiền phạt',
    icon: Receipt,
  },
  {
    id: 'BORROW_SLIP_MANAGER',
    label: 'Quản lý Phiếu Mượn',
    icon: FileText,
  },
  {
    id: 'FINE_RECEIPT_MANAGER',
    label: 'Quản lý Phiếu Thu',
    icon: CheckCircle2,
  },
  { id: 'REPORTS', label: 'Báo cáo', icon: ChartColumn },
  {
    id: 'REGULATIONS',
    label: 'Quy định',
    icon: SlidersHorizontal,
  },
  { id: 'USER_ROLES', label: 'Phân quyền', icon: Shield },
  { id: 'USER_ACCOUNTS', label: 'Tài khoản', icon: UserPlus },
];
