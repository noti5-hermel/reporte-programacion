import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { ICellEditorParams } from 'ag-grid-community';

/**
 * Componente de edición personalizado para AG Grid que utiliza un input de tipo 'color'.
 */
const ColorPickerEditor = forwardRef((props: ICellEditorParams, ref) => {
  const [value, setValue] = useState(props.value || '#ffffff'); // Inicia con el valor de la celda o blanco
  const inputRef = useRef<HTMLInputElement>(null);

  // Cuando AG Grid monta este componente, automáticamente hace focus en el input.
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.click(); // Simula un clic para abrir el selector de color inmediatamente
  }, []);

  /*
   * Expone los métodos que AG Grid necesita para interactuar con este editor.
   */
  useImperativeHandle(ref, () => {
    return {
      // Este método es obligatorio. AG Grid lo llama para obtener el valor final de la edición.
      getValue() {
        return value;
      },

      // Opcional: Se usa para determinar si se debe detener la edición (por ejemplo, si se presiona 'Escape').
      // En este caso, no lo necesitamos, así que retornamos true para permitir siempre la detención.
      isCancelAfterEnd() {
        return false;
      },
    };
  });

  return (
    <input
      ref={inputRef}
      type="color"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={{ width: '100%', height: '100%', padding: 0, border: 'none' }}
    />
  );
});

export default ColorPickerEditor;
