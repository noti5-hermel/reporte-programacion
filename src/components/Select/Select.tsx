import { ChangeEvent } from 'react';

/**
 * @typedef {object} SelectOption
 * @description Define la estructura de una opción para el componente Select.
 * @property {string | number} value - El valor real de la opción.
 * @property {string} label - El texto que se mostrará al usuario.
 */
type SelectOption = {
  value: string | number;
  label: string;
};

/**
 * @typedef {object} SelectProps
 * @description Propiedades para el componente Select reutilizable.
 * @property {string} id - ID único para el elemento select.
 * @property {string} label - Texto para la etiqueta del select.
 * @property {string | number} value - El valor actualmente seleccionado.
 * @property {(e: ChangeEvent<HTMLSelectElement>) => void} onChange - Función que se ejecuta al cambiar la selección.
 * @property {SelectOption[]} options - Array de opciones para mostrar en el select.
 */
type SelectProps = {
  id: string;
  label: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
};

/**
 * Componente `Select`
 * 
 * Un componente de selector (dropdown) reutilizable con una etiqueta.
 * Simplifica la creación de menús desplegables en toda la aplicación.
 */
export const Select = ({ id, label, value, onChange, options }: SelectProps) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
