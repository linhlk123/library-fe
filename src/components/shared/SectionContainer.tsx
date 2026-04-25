import type { PropsWithChildren } from 'react';

interface SectionContainerProps extends PropsWithChildren {
  title: string;
  description: string;
}

export const SectionContainer = ({
  title,
  description,
  children,
}: SectionContainerProps) => {
  return (
    <section className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {children}
      </div>
    </section>
  );
};

export default SectionContainer;
