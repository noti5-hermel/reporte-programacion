// Se elimina 'import React' porque ya no es necesario en las versiones modernas.

import type { ICellRendererParams } from 'ag-grid-community';

/**
 * Componente para renderizar una celda que muestra un color.
 * Muestra un pequeño cuadro de color y el código hexadecimal.
 */
const ColorCellRenderer = (props: ICellRendererParams) => {
  if (!props.value) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <div
        style={{
          width: '20px',
          height: '20px',
          backgroundColor: props.value,
          border: '1px solid #ccc',
          marginRight: '10px',
        }}
      />
      <span>{props.value}</span>
    </div>
  );
};

export default ColorCellRenderer;
