import SectionContainer from '../../components/shared/SectionContainer';

const reportCards = [
  { title: 'Bao cao ton sach', value: '124', subtitle: 'Dau sach ton kho' },
  { title: 'Bao cao muon tre', value: '18', subtitle: 'Doc gia tre han' },
  { title: 'Bao cao tien phat', value: '12,500,000 VND', subtitle: 'Thang hien tai' },
];

const ReportsView = () => {
  return (
    <SectionContainer
      title="Lap bao cao"
      description="Tong hop tinh hinh sach, muon tra va tien phat."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportCards.map((card) => (
          <article key={card.title} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
          </article>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <button className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
          Xuat bao cao PDF
        </button>
      </div>
    </SectionContainer>
  );
};

export default ReportsView;
