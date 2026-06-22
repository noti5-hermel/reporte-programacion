import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  searchQuery,
  onSearchChange,
  placeholder = "Buscar...",
}: SearchBarProps) => {
  return (
    <div className="relative flex-grow">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-subtitle"
        size={20}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-background-primary border border-border-card rounded-xl text-sm font-medium text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all"
      />
    </div>
  );
};
