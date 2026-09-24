import type { Key, ReactNode } from "react";
import "./DataTable.css";

export interface DataTableColumn<T> {
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => Key;
  mensagemVazia?: string;
}

export function DataTable<T>({ columns, data, keyExtractor, mensagemVazia = "Nenhum registro encontrado." }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="tabela-vazia">
        <p>{mensagemVazia}</p>
      </div>
    );
  }

  return (
    <div className="tabela-container">
      <table className="tabela">
        <thead>
          <tr>
            {columns.map((coluna) => (
              <th key={coluna.header} className={coluna.className}>
                {coluna.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={keyExtractor(item)}>
              {columns.map((coluna) => (
                <td key={coluna.header} className={coluna.className}>
                  {coluna.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
