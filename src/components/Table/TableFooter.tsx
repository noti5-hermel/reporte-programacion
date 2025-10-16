import React from 'react';

interface TableFooterProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords: number;
  pageSize: number;
}

const TableFooter: React.FC<TableFooterProps> = ({
  page,
  totalPages,
  onPageChange,
  totalRecords,
  pageSize,
}) => {
  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalRecords);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 mx-1 rounded-full text-sm ${
            page === i
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-b-lg border-t border-gray-200">
      <span className="text-sm text-gray-600">
        Mostrando {startRecord}-{endRecord} de {totalRecords} registros
      </span>

      <div className="flex items-center">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 text-sm text-gray-600 disabled:opacity-50"
        >
          {'<'}
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 text-sm text-gray-600 disabled:opacity-50"
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};

export default TableFooter;
