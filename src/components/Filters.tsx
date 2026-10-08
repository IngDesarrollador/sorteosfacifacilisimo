import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export interface FiltersProps {
  onSearch: (query: string, type: string, orden: boolean, maxWinners: number) => void;
  onFilterTypeChange?: (type: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ onSearch, onFilterTypeChange }) => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('aleatorio');
  const [orden, setOrden] = useState(false);
  const [maxWinners, setMaxWinners] = useState(1);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    onFilterTypeChange?.(newType);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim(), type, orden, maxWinners);
    setQuery('');
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full flex flex-wrap gap-4 items-center justify-center bg-gray-800/70 rounded-2xl p-6 shadow-lg border border-gray-700"
    >
      <select
        value={type}
        onChange={e => handleTypeChange(e.target.value)}
        className="px-4 py-2 rounded-xl bg-gray-900/80 border-2 border-gray-700 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 text-white shadow-md transition-all duration-200 outline-none text-base cursor-pointer"
      >
        <option value="aleatorio">Aleatorio</option>
        <option value="numero">Número</option>
        <option value="palabra">Palabra clave</option>
        <option value="marcador">Marcador</option>
      </select>
      {type !== 'aleatorio' && (
        <input
          type="text"
          placeholder="Buscar número, palabra o marcador..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-56 px-4 py-2 rounded-xl bg-gray-900/80 border-2 border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 text-white placeholder:text-blue-200 shadow-md transition-all duration-200 outline-none text-base"
        />
      )}
      {type === 'numero' && (
        <label className="flex items-center gap-2 text-blue-200 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={orden}
            onChange={e => setOrden(e.target.checked)}
            className="accent-yellow-400 w-5 h-5 rounded border-2 border-gray-500 focus:ring-2 focus:ring-yellow-300 transition-all duration-200"
          />
          <span className="text-base">En orden</span>
        </label>
      )}
      <input
        type="number"
        min={1}
        value={maxWinners}
        onChange={e => setMaxWinners(Number(e.target.value))}
        className="w-20 px-3 py-2 rounded-xl bg-gray-900/80 border-2 border-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-300 text-white placeholder:text-green-200 shadow-md transition-all duration-200 outline-none text-base"
        placeholder="# Ganadores"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold text-base px-6 py-2 rounded-xl shadow-lg border-2 border-yellow-300 hover:from-yellow-500 hover:to-yellow-400 hover:scale-105 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 animate-pulse"
      >
        <FaSearch className="text-blue-900 text-lg" /> Buscar Ganadores
      </button>
    </form>
  );
};

export default Filters;
