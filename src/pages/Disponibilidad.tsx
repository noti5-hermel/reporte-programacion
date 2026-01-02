import { useState, useEffect } from "react";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import type { ColDef } from 'ag-grid-community';
import { SearchBar } from "../components/SearchBar/SearchBar";
import { API_BASE_URL } from "../api/config";
import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

/**
 * Componente `DisponibilidadPage`
 * 
 * Muestra una tabla interactiva con los datos de disponibilidad de inventario
 * utilizando la librería AG Grid. Los datos son cargados desde un endpoint de la API.
 */
const DisponibilidadPage = () => {
  // --- ESTADOS DEL COMPONENTE ---
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Definición de las columnas para AG Grid.
   * La propiedad 'field' debe coincidir EXACTAMENTE con la clave del JSON de la API.
   */
  const columnDefs: ColDef[] = [
    { headerName: "Código", field: "codigo", sortable: true, filter: true },
    { headerName: "Descripción", field: "descripcion", sortable: true, filter: true },
    { headerName: "Disponible", field: "disponible", sortable: true, filter: 'agNumberColumnFilter' },
    { headerName: "Mínimo", field: "minimo", sortable: true, filter: 'agNumberColumnFilter' },
    { headerName: "Reorder", field: "reorder", sortable: true, filter: 'agNumberColumnFilter' },
    { headerName: "Días Disponibles", field: "dias_disponibles", sortable: true, filter: 'agNumberColumnFilter' }
  ];

  // Efecto para cargar los datos desde la API al montar el componente.
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/v1/available/`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const result = await response.json();
          setRowData(Array.isArray(result) ? result : []);
        } else {
          setError("No se pudieron cargar los datos de disponibilidad.");
        }
      } catch (err) {
        setError("Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSearchQueryChanged = (value: string) => {
    setSearchQuery(value);
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Reporte de Disponibilidad de Inventario</h1>
      
      <div className="flex items-center">
        <SearchBar searchQuery={searchQuery} onSearchChange={onSearchQueryChanged} />
      </div>

      {loading ? (
        <p>Cargando datos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={20}
            quickFilterText={searchQuery}
            defaultColDef={{
              resizable: true,
              flex: 1,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DisponibilidadPage;
