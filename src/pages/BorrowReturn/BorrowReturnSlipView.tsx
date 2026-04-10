import { useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';

const BorrowReturnSlipView = () => {
  const [slip, setSlip] = useState({
    readerId: '',
    bookId: '',
    action: 'MUON',
    date: '',
  });

  return (
    <SectionContainer
      title="Lap phieu muon tra sach"
      description="Tao phieu xu ly muon hoac tra sach cho doc gia."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm text-gray-600">
          Ma doc gia
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={slip.readerId}
            onChange={(e) => setSlip((p) => ({ ...p, readerId: e.target.value }))}
          />
        </label>
        <label className="text-sm text-gray-600">
          Ma sach
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={slip.bookId}
            onChange={(e) => setSlip((p) => ({ ...p, bookId: e.target.value }))}
          />
        </label>
        <label className="text-sm text-gray-600">
          Loai phieu
          <select
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={slip.action}
            onChange={(e) => setSlip((p) => ({ ...p, action: e.target.value }))}
          >
            <option value="MUON">Muon sach</option>
            <option value="TRA">Tra sach</option>
          </select>
        </label>
        <label className="text-sm text-gray-600">
          Ngay lap phieu
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={slip.date}
            onChange={(e) => setSlip((p) => ({ ...p, date: e.target.value }))}
          />
        </label>
        <button className="md:col-span-2 justify-self-start rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
          Tao phieu
        </button>
      </div>
    </SectionContainer>
  );
};

export default BorrowReturnSlipView;
