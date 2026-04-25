export const isPendingBorrowStatus = (status?: string | null): boolean => {
  const normalized = (status ?? '').trim().toUpperCase();

  return (
    normalized === 'PENDING' ||
    normalized === 'CHO_DUYET' ||
    normalized === 'CHỜ_DUYỆT' ||
    normalized === 'CHO DUYET' ||
    normalized === 'CHỜ DUYỆT'
  );
};
