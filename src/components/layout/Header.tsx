import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  search: string;
  setSearch: (search: string) => void;
  setIsAddingEmployee: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  search,
  setSearch,
  setIsAddingEmployee
}) => {
  return (
    <header className="h-16 border-b border-zinc-200 bg-white px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <Search className="w-5 h-5 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Zoek medewerkers of taken..." 
          className="flex-1 bg-transparent focus:outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={() => setIsAddingEmployee(true)} className="h-10">
          <Plus className="w-4 h-4" />
          Nieuwe Medewerker
        </Button>
      </div>
    </header>
  );
};
