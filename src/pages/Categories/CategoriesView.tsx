import { useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';

const CategoriesView = () => {
  const [categories, setCategories] = useState(['Cong nghe thong tin', 'Kinh te']);
  const [name, setName] = useState('');

  const addCategory = () => {
    if (!name.trim()) return;
    setCategories((p) => [...p, name.trim()]);
    setName('');
  };

  return (
    <SectionContainer
      title="Nhap danh sach the loai"
      description="Quan ly danh muc the loai sach."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Ten the loai"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={addCategory}
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
          >
            Them
          </button>
        </div>
        <ul className="grid sm:grid-cols-2 gap-2">
          {categories.map((item) => (
            <li key={item} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </SectionContainer>
  );
};

export default CategoriesView;
