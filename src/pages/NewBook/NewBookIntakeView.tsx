import { useState } from 'react';
import SectionContainer from '../../components/shared/SectionContainer';

const NewBookIntakeView = () => {
  const [book, setBook] = useState({
    title: '',
    author: '',
    category: '',
    publisher: '',
    quantity: 1,
  });

  return (
    <SectionContainer
      title="Tiep nhan sach moi"
      description="Nhap thong tin sach moi va so luong ban sao."
    >
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm text-gray-600 md:col-span-2">
          Ten sach
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={book.title}
            onChange={(e) => setBook((p) => ({ ...p, title: e.target.value }))}
          />
        </label>
        <label className="text-sm text-gray-600">
          Tac gia
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={book.author}
            onChange={(e) => setBook((p) => ({ ...p, author: e.target.value }))}
          />
        </label>
        <label className="text-sm text-gray-600">
          The loai
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={book.category}
            onChange={(e) => setBook((p) => ({ ...p, category: e.target.value }))}
          />
        </label>
        <label className="text-sm text-gray-600">
          Nha xuat ban
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={book.publisher}
            onChange={(e) => setBook((p) => ({ ...p, publisher: e.target.value }))}
          />
        </label>
        <label className="text-sm text-gray-600">
          So luong
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={book.quantity}
            onChange={(e) =>
              setBook((p) => ({ ...p, quantity: Number(e.target.value) }))
            }
          />
        </label>
        <button className="md:col-span-2 justify-self-start rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
          Luu thong tin sach moi
        </button>
      </div>
    </SectionContainer>
  );
};

export default NewBookIntakeView;
