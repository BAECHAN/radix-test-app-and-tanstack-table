// src/App.tsx
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';

// 데이터 타입 정의
type DataItem = {
  id: number;
  name: string;
  email: string;
};

// API 호출 함수
const fetchData = async ({ queryKey }: { queryKey: [string, number, number] }): Promise<{ data: DataItem[]; total: number }> => {
  const [_key, pageIndex, pageSize] = queryKey;
  // 실제 API 엔드포인트와 파라미터에 맞게 수정하세요.
  const response = await axios.get('https://api.example.com/data', {
    params: {
      page: pageIndex,
      limit: pageSize,
    },
  });
  return response.data;
};

const App: React.FC = () => {
  // 페이지 인덱스와 페이지 크기 상태 관리
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // React Query로 데이터 fetch (페이지 전환 시 이전 데이터를 유지)
  const { data, isLoading, error } : any = useQuery<any>({
    queryKey: ['data'],
    queryFn: fetchData
  });
  // TanStack Table에 사용할 컬럼 정의
  const columns = useMemo<ColumnDef<DataItem, any>[]>(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
  ], []);

  // TanStack Table 인스턴스 생성 (manualPagination 옵션 사용)
  const table = useReactTable({
    data: data?.data || [],
    columns,
    manualPagination: true,
    pageCount: data ? Math.ceil(data.total / pageSize) : 0,
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function'
        ? updater({ pageIndex, pageSize })
        : updater;
      setPageIndex(newPagination.pageIndex);
      setPageSize(newPagination.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching data.</div>;

  return (
    <div style={{ padding: '1rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }} border={1} cellPadding={8}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : 
                    flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell ?? ((info) => info.getValue()),
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 UI */}
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
          {'<<'}
        </button>
        <button onClick={() => setPageIndex(old => Math.max(old - 1, 0))} disabled={pageIndex === 0}>
          {'<'}
        </button>
        <span>
          Page <strong>{pageIndex + 1}</strong> of <strong>{table.getPageCount()}</strong>
        </span>
        <button onClick={() => setPageIndex(old => Math.min(old + 1, table.getPageCount() - 1))}
          disabled={pageIndex >= table.getPageCount() - 1}>
          {'>'}
        </button>
        <button onClick={() => setPageIndex(table.getPageCount() - 1)}
          disabled={pageIndex >= table.getPageCount() - 1}>
          {'>>'}
        </button>
      </div>
    </div>
  );
};

export default App;
