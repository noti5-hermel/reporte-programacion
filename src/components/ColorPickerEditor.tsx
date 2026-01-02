import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { ICellEditorParams } from 'ag-grid-community';

/**
 * Componente de edición personalizado para AG Grid que utiliza un input de tipo 'color'.
 */
const ColorPickerEditor = forwardRef((props: ICellEditorParams, ref) => {
  const [value, setValue] = useState(props.value || '#ffffff');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.click();
  }, []);

  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return value;
      },
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
      // --- INICIO DE LA CORRECCIÓN ---
      // Llama a stopEditing() cuando el selector de color se cierra (pierde el foco).
      // Esto le notifica a AG Grid que la edición ha finalizado y que debe tomar el nuevo valor.
      onBlur={() => props.stopEditing()}
      // --- FIN DE LA CORRECCIÓN ---
      style={{ width: '100%', height: '100%', padding: 0, border: 'none' }}
    />
  );
});

export default ColorPickerEditor;
