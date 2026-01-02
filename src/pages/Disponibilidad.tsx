import { useState, useEffect, useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Se añade RowStyleParams para tipar la función de estilo de fila
import type { ColDef, CellValueChangedEvent, RowStyleParams } from "ag-grid-community";

import { SearchBar } from "../components/SearchBar/SearchBar";
import { API_BASE_URL } from "../api/config";

// 1. Importar los nuevos componentes de color
import ColorCellRenderer from "../components/ColorCellRenderer";
import ColorPickerEditor from "../components/ColorPickerEditor";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const DisponibilidadPage = () => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /* =========================
     COLUMNAS
  ========================== */
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Código",
        field: "codigo",
        pinned: "left",
        editable: false,
        filter: true,
        headerClass: "font-semibold",
      },
      {
        headerName: "Descripción",
        field: "description",
        filter: true,
        editable: false,
      },
       // 2. AÑADIR LA NUEVA COLUMNA DE COLOR
      {
        headerName: "Color",
        field: "color", // Debe coincidir con el campo de la API
        editable: true,  // ¡Importante para permitir la edición!
        width: 150,
        // Componente para VISUALIZAR el color
        cellRenderer: ColorCellRenderer,
        // Componente para EDITAR el color (con doble clic)
        cellEditor: ColorPickerEditor, 
      },
      {
        headerName: "Disponible",
        field: "disponible",
        editable: true,
        filter: "agNumberColumnFilter",
        valueParser: (p) => Number(p.newValue) || 0,
        cellClassRules: {
          "bg-red-100 text-red-700 font-semibold": (p) =>
            p.value <= p.data.minimo,
        },
      },
      {
        headerName: "Mínimo",
        field: "minimo",
        editable: true,
        filter: "agNumberColumnFilter",
        valueParser: (p) => Number(p.newValue) || 0,
        headerTooltip: "Cantidad mínima permitida",
      },
      {
        headerName: "Reorder",
        field: "reorder",
        editable: true,
        filter: "agNumberColumnFilter",
        valueParser: (p) => Number(p.newValue) || 0,
      },
      {
        headerName: "Días Disponibles",
        field: "dias_disponibles",
        editable: false,
        filter: "agNumberColumnFilter",
        cellClassRules: {
          "text-red-600 font-bold": (p) => p.value <= 30,
          "text-yellow-600 font-semibold": (p) =>
            p.value > 30 && p.value <= 60,
          "text-green-600": (p) => p.value > 60,
        },
      },
      {
        headerName: "Estado",
        valueGetter: (p) =>
          p.data.disponible <= p.data.minimo ? "CRÍTICO" : "OK",
        cellClassRules: {
          "text-red-600 font-bold": (p) => p.value === "CRÍTICO",
          "text-green-600 font-semibold": (p) => p.value === "OK",
        },
      },
    ],
    []
  );

  /* =========================
     FETCH
  ========================== */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/v1/available/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setRowData(Array.isArray(data) ? data : []);
      } catch {
        setError("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================
     EDICIÓN
  ========================== */
  const onCellValueChanged = useCallback(
    async (event: CellValueChangedEvent) => {
      if (event.newValue === event.oldValue) return;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/v1/available/${event.data.id}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              [event.colDef.field!]: event.newValue,
            }),
          }
        );

        if (!res.ok) throw new Error();

        // ***** LA SOLUCIÓN *****
        // Después de un guardado exitoso, forzamos a la fila a redibujarse.
        // Esto hará que AG Grid vuelva a ejecutar `getRowStyle` para esta fila específica,
        // aplicando el nuevo color de fondo.
        event.api.redrawRows({ rowNodes: [event.node] });

      } catch {
        // Si la API falla, revertimos el cambio visual en la tabla.
        event.node.setDataValue(event.colDef.field!, event.oldValue);
        alert("Error al guardar el cambio");
      }
    },
    []
  );

  /* =========================
     GRID DEFAULTS
  ========================== */
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      headerClass: "font-semibold text-gray-700",
    }),
    []
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">
        Reporte de Disponibilidad de Inventario
      </h1>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {loading ? (
        <p>Cargando datos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="ag-theme-quartz" style={{ height: 600 }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination
            paginationPageSize={20}
            quickFilterText={searchQuery}
            animateRows
            enableBrowserTooltips
            floatingFilter
            stopEditingWhenCellsLoseFocus
            rowSelection="multiple"
            onCellValueChanged={onCellValueChanged}
            getRowStyle={(params: RowStyleParams) => {
              if (params.data && params.data.color) {
                return { background: params.data.color };
              }
              if (params.node.rowIndex % 2 === 0) {
                return { background: "#fafafa" };
              }
              return undefined;
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DisponibilidadPage;
