import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { OverlayPanel } from 'primereact/overlaypanel';
import { fetchArtworks, Artwork } from '../api/artworks';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';

interface SelectedRowsMap {
  [page: number]: Set<number>; 
}

const DataTableComponent: React.FC = () => {
  const [selectedRowIdsMap, setSelectedRowIdsMap] = useState<SelectedRowsMap>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [customRowCount, setCustomRowCount] = useState<number | null>(null);

  const overlayRef = useRef<OverlayPanel>(null);

  // Fetch data for the current page
  const { data, isLoading } = useQuery({
    queryKey: ['artworks', currentPage, rowsPerPage],
    queryFn: () => fetchArtworks(currentPage, rowsPerPage),
  });

  
  const onPageChange = (event: { page: number; rows: number }) => {
    setCurrentPage(event.page + 1); 
    setRowsPerPage(event.rows);
  };

  // row selection/deselection
  const onSelectionChange = (e: { value: Artwork[] }) => {
    const selectedIds = e.value.map((row) => row.id); 
    const updatedSelectedRowIdsMap = { ...selectedRowIdsMap };
    updatedSelectedRowIdsMap[currentPage] = new Set(selectedIds); 
    setSelectedRowIdsMap(updatedSelectedRowIdsMap);
  };

  // Get selected rows for the current page
  const getSelectedRows = () => {
    const selectedIdsSet = selectedRowIdsMap[currentPage] || new Set();
    return data?.data.filter((row) => selectedIdsSet.has(row.id)) || [];
  };

  // custom row selection
  const handleCustomRowSelection = () => {
    if (customRowCount && data?.data) {
      let totalSelected = 0;
      const selectedIds = new Set<number>();

      for (let page = 1; totalSelected < customRowCount; page++) {
        const pageData = data?.data || [];
        for (const row of pageData) {
          if (totalSelected >= customRowCount) break;
          selectedIds.add(row.id);
          totalSelected++;
        }
      }

      const updatedSelectedRowIdsMap = { ...selectedRowIdsMap };
      updatedSelectedRowIdsMap[currentPage] = selectedIds;
      setSelectedRowIdsMap(updatedSelectedRowIdsMap);
      overlayRef.current?.hide();
    }
  };

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataTable
            value={data?.data}
            selection={getSelectedRows()} 
            onSelectionChange={onSelectionChange}
            dataKey="id"
            selectionMode="multiple"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
            <Column field="title" header="Title"></Column>
            <Column field="place_of_origin" header="Place of Origin"></Column>
            <Column field="artist_display" header="Artist"></Column>
            <Column field="inscriptions" header="Inscriptions"></Column>
            <Column field="date_start" header="Start Date"></Column>
            <Column field="date_end" header="End Date"></Column>
          </DataTable>

          {/* Paginator */}
          <Paginator
            first={(currentPage - 1) * rowsPerPage}
            rows={rowsPerPage}
            totalRecords={data?.pagination?.total || 0} 
            onPageChange={onPageChange}
          />

          {/* Overlay Panel */}
          <OverlayPanel ref={overlayRef}>
            <div className="p-fluid">
              <div className="p-field">
                <label htmlFor="rowCount">Select Row</label>
                <InputNumber
                  id="rowCount"
                  value={customRowCount}
                  onValueChange={(e) => setCustomRowCount(e.value as number)}
                />
              </div>
              <Button label="Submit" onClick={handleCustomRowSelection} />
            </div>
          </OverlayPanel>

          <Button
            type="button"
            label="Select Row"
            icon="pi pi-external-link"
            onClick={(e) => overlayRef.current?.toggle(e)}
          />

          {/* Display all selected rows */}
          <div>
            {Object.entries(selectedRowIdsMap).map(([page, selectedIds]) => (
              <div key={page}>
                <strong>Page {page}:</strong>
                {[...selectedIds].map((id) => (
                  <p key={id}>Row ID: {id}</p>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DataTableComponent;

