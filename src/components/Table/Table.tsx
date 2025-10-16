import React from 'react';

interface TableProps {
  headers: string[];
  data: (string | number | React.ReactNode)[][];
}

const Table: React.FC<TableProps> = ({ headers, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-white">
          <tr className="border-b-2 border-gray-200">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left font-semibold text-gray-600"
              >
                {header} :
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {headers[cellIndex] === 'Acciones' ? (
                    <a href="#" className="text-blue-600 hover:underline">
                      {cell}
                    </a>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
