import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: 'all' | 'expense' | 'income';
  onTypeFilterChange: (value: 'all' | 'expense' | 'income') => void;
  sortBy: 'name' | 'transactions' | 'amount';
  onSortByChange: (value: 'name' | 'transactions' | 'amount') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  sortBy,
  onSortByChange,
}) => (
  <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
      <Input
        placeholder="Cerca categorie..."
        className="pl-10"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>

    <div className="flex flex-wrap gap-3">
      <div className="min-w-[140px]">
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filtra per tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            <SelectItem value="expense">Solo spese</SelectItem>
            <SelectItem value="income">Solo entrate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[140px]">
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger>
            <SelectValue placeholder="Ordina per" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="transactions">N. transazioni</SelectItem>
            <SelectItem value="amount">Importo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

export default FilterBar;