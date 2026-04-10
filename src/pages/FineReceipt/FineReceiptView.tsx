import { useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';

const FineReceiptView = () => {
  const [receipt, setReceipt] = useState({
    readerId: '',
    reason: '',
    amount: 0,
    paidDate: '',
  });

  return (
    <SectionContainer
      title="Lap phieu thu tien phat"
      description="Tao phieu thu va ghi nhan thanh toan tien phat."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm text-gray-600">
          Ma doc gia
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={receipt.readerId}
            onChange={(e) =>
              setReceipt((p) => ({ ...p, readerId: e.target.value }))
            }
          />
        </label>
        <label className="text-sm text-gray-600">
          Ly do phat
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={receipt.reason}
            onChange={(e) => setReceipt((p) => ({ ...p, reason: e.target.value }))}
          />
        </label>
        <label className="text-sm text-gray-600">
          So tien
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={receipt.amount}
            onChange={(e) =>
              setReceipt((p) => ({ ...p, amount: Number(e.target.value) }))
            }
          />
        </label>
        <label className="text-sm text-gray-600">
          Ngay thu
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={receipt.paidDate}
            onChange={(e) =>
              setReceipt((p) => ({ ...p, paidDate: e.target.value }))
            }
          />
        </label>
        <button className="md:col-span-2 justify-self-start rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
          Tao phieu thu
        </button>
      </div>
    </SectionContainer>
  );
};

export default FineReceiptView;
