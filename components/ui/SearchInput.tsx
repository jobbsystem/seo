import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ containerClassName = '', className = '', ...props }) => {
  return (
    <div className={`relative ${containerClassName}`}>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        className={`w-full rounded-full bg-white/70 backdrop-blur-xl shadow-[0_8px_20px_rgba(15,23,42,0.06)] px-10 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 ${className}`}
        {...props}
      />
    </div>
  );
};

export default SearchInput;
