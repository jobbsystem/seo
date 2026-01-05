import React from 'react';
import { FunnelIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import SearchInput from './ui/SearchInput';

const FilesPage: React.FC = () => {
  return (
    <div className="space-y-3 sm:space-y-4 animate-fade-in pb-6 sm:pb-8">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Bilagor</h1>
            <p className="text-slate-600 mt-1 font-medium text-sm sm:text-base">Dokumentation, rapporter och avtal.</p>
        </div>
      </div>

      <GlassCard className="p-2.5 flex flex-col md:flex-row gap-2.5 sm:gap-3 items-center">
        <div className="flex-1 w-full">
          <SearchInput placeholder="Sök bland bilagor..." containerClassName="w-full" />
        </div>
        <Button variant="secondary" className="w-full md:w-auto flex items-center justify-center gap-2 text-xs sm:text-sm">
          <span>Filter</span>
          <FunnelIcon className="h-4 w-4" />
        </Button>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
         {/* Upload Card */}
         <GlassCard className="bg-white/70 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center text-center hover:bg-white/80 transition-colors cursor-pointer group min-h-[120px] sm:min-h-[140px]">
             <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900/5 rounded-full flex items-center justify-center mb-2 group-hover:text-accent transition-colors">
                <PlusIcon />
             </div>
             <p className="font-semibold text-slate-900">Ladda upp fil</p>
             <p className="text-xs text-slate-600 mt-1">PDF, DOCX, PNG (Max 10MB)</p>
             <p className="text-[11px] text-slate-500 mt-2">Dra och släpp eller välj från datorn.</p>
         </GlassCard>
      </div>

      <GlassCard className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
         <FolderOpenIcon className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400 mb-3" />
         <h3 className="font-semibold text-slate-900 text-sm">Inga filer att visa just nu</h3>
         <p className="text-xs text-slate-600 mt-2">Ladda upp avtal, rapporter och material för snabb åtkomst.</p>
      </GlassCard>
    </div>
  );
};

const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
)

export default FilesPage;
