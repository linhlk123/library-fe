import { useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';

const ReaderTypesView = () => {
  const [types, setTypes] = useState(['Sinh vien', 'Giang vien']);
  const [newType, setNewType] = useState('');

  const addType = () => {
    if (!newType.trim()) return;
    setTypes((p) => [...p, newType.trim()]);
    setNewType('');
  };

  return (
    <SectionContainer
      title="Nhap danh sach cac loai doc gia"
      description="Quan ly danh muc loai doc gia dung trong he thong."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Vi du: Hoc vien cao hoc"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
          <button
            onClick={addType}
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
          >
            Them
          </button>
        </div>
        <ul className="space-y-2">
          {types.map((typeItem) => (
            <li
              key={typeItem}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
            >
              {typeItem}
            </li>
          ))}
        </ul>
      </div>
    </SectionContainer>
  );
};

export default ReaderTypesView;
