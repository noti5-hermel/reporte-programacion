// Se elimina 'import React' porque ya no es necesario en las versiones modernas.
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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
      onBlur={() => props.stopEditing()}
      style={{ width: '100%', height: '100%', padding: 0, border: 'none' }}
    />
  );
});

export default ColorPickerEditor;
