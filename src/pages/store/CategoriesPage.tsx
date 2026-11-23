import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SafeImage } from '../../components/ui/SafeImage';
import { useCategoriesQuery } from '../../hooks/useCommerceQueries';

export function CategoriesPage() {
  const { data: categories = [] } = useCategoriesQuery();

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">
          Design Disciplines
        </h1>
        <p className="mt-2 text-base text-[#737373]">
          Browse our four core collections crafted across partner workshops in Copenhagen, Aarhus, Oslo, and Kyoto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/shop?category=${cat.id}`}
            className="group grid grid-cols-1 sm:grid-cols-12 bg-[#F8F8F7] border border-[#E5E5E5] rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(23,23,23,0.06)]"
          >
            <div className="sm:col-span-6 aspect-[4/3] sm:aspect-auto sm:min-h-[240px] bg-[#EFEFED] overflow-hidden">
              <SafeImage
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </div>
            <div className="sm:col-span-6 p-7 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] tabular-nums">
                  {cat.productCount} Objects
                </p>
                <h2 className="mt-2 text-xl font-bold text-[#171717] group-hover:text-[#2563EB] transition-colors">
                  {cat.name}
                </h2>
                <p className="mt-2 text-sm text-[#737373] leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#171717]">
                Explore Category
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
