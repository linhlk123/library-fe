import type { PropsWithChildren } from 'react';

interface SectionContainerProps extends PropsWithChildren {
  title: string;
  description: string;
}

const SectionContainer = ({
  title,
  description,
  children,
}: SectionContainerProps) => {
  return (
    <section className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      {children}
    </section>
  );
};

export default SectionContainer;
