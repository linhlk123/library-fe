import { useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';

const RegulationsView = () => {
  const [rules, setRules] = useState({
    maxBooks: 3,
    maxBorrowDays: 14,
    finePerDay: 5000,
  });

  return (
    <SectionContainer
      title="Thay doi quy dinh"
      description="Cap nhat cac tham so hoat dong cua thu vien."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="text-sm text-gray-600">
          So sach muon toi da
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={rules.maxBooks}
            onChange={(e) =>
              setRules((p) => ({ ...p, maxBooks: Number(e.target.value) }))
            }
          />
        </label>
        <label className="text-sm text-gray-600">
          So ngay muon toi da
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={rules.maxBorrowDays}
            onChange={(e) =>
              setRules((p) => ({ ...p, maxBorrowDays: Number(e.target.value) }))
            }
          />
        </label>
        <label className="text-sm text-gray-600">
          Muc phat moi ngay (VND)
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={rules.finePerDay}
            onChange={(e) =>
              setRules((p) => ({ ...p, finePerDay: Number(e.target.value) }))
            }
          />
        </label>
        <button className="md:col-span-3 justify-self-start rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
          Luu quy dinh
        </button>
      </div>
    </SectionContainer>
  );
};

export default RegulationsView;
