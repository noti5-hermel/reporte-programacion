import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchBar = ({
  searchQuery,
  onSearchChange,
  placeholder = "Buscar...",
  debounceMs = 300,
}: SearchBarProps) => {
  // El valor visible se actualiza al instante; el padre solo recibe el texto
  // cuando termina la pausa. Así no se dispara una petición por pulsación.
  const [value, setValue] = useState(searchQuery);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastEmittedRef = useRef(searchQuery);

  useEffect(() => {
    setValue(searchQuery);
    lastEmittedRef.current = searchQuery;
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [searchQuery]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleChange = (nextValue: string) => {
    setValue(nextValue);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (nextValue !== lastEmittedRef.current) {
        lastEmittedRef.current = nextValue;
        onSearchChange(nextValue);
      }
    }, debounceMs);
  };

  return (
    <div className="relative flex-grow">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-subtitle"
        size={20}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-background-primary border border-border-card rounded-xl text-sm font-medium text-title focus:ring-2 focus:ring-button-primary/20 focus:border-button-primary outline-none transition-all"
      />
    </div>
  );
};
