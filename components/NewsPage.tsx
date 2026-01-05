import React from 'react';
import { NEWS_ITEMS } from '../constants';
import { ClockIcon, ArrowRightIcon, CalendarIcon } from '@heroicons/react/24/outline';
import GlassCard from './ui/GlassCard';

const NewsPage: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in pb-6 sm:pb-8">
      <GlassCard className="p-4 sm:p-5">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Nyheter</h1>
        <p className="text-slate-600 mt-2 font-medium text-sm sm:text-base">Håll dig uppdaterad med det senaste från oss.</p>
      </GlassCard>

      <div className="grid gap-4 sm:gap-5">
        {NEWS_ITEMS.map((item) => (
          <GlassCard key={item.id} className="overflow-hidden flex flex-col md:flex-row h-full md:h-56 group cursor-pointer">
            <div className="md:w-1/3 relative overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-3 left-3 bg-white/70 backdrop-blur-xl px-2.5 py-0.5 rounded-full text-xs font-semibold text-slate-700 flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" /> {item.date}
              </div>
            </div>
            <div className="p-4 sm:p-5 md:w-2/3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">Nyhet</span>
                  <span className="text-slate-500 text-xs font-medium flex items-center gap-1"><ClockIcon className="h-3 w-3" /> {item.readTime}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 group-hover:text-accent transition-colors leading-tight">{item.title}</h2>
                <p className="text-slate-600 leading-relaxed line-clamp-2 text-sm sm:text-base">{item.summary}</p>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center gap-2 text-slate-700 text-xs sm:text-sm font-semibold group-hover:gap-4 transition-all">
                Läs hela artikeln <ArrowRightIcon className="h-4 w-4" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
