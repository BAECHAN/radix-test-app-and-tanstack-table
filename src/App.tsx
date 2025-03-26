// src/App.tsx
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";

// 데이터 타입 정의
type DataItem = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
};

// API 호출 함수
const fetchData = async ({
  queryKey,
}: {
  queryKey: readonly [string, number, number];
}): Promise<{ data: DataItem[]; total: number }> => {
  const [_key, pageIndex, pageSize] = queryKey;
  const response = await axios.get("https://reqres.in/api/users", {
    params: {
      page: pageIndex + 1, // reqres의 페이지는 1부터 시작합니다.
      per_page: pageSize,
    },
  });
  return { data: response.data.data, total: response.data.total };
};

const App: React.FC = () => {
  // 페이지 인덱스와 페이지 크기 상태 관리
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);

  // React Query로 데이터 fetch (페이지 전환 시 이전 데이터를 유지)
  const { data, isLoading, error }: any = useQuery({
    queryKey: ["data", pageIndex, pageSize] as const,
    queryFn: fetchData,
  });
  // TanStack Table에 사용할 컬럼 정의
  const columns = useMemo<ColumnDef<DataItem>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        enableSorting: true,
      },
      {
        accessorKey: "first_name",
        header: "First Name",
        enableSorting: true,
      },
      {
        accessorKey: "last_name",
        header: "Last Name",
        enableSorting: true,
      },
      {
        accessorKey: "email",
        header: "Email",
        enableSorting: true,
      },
      {
        accessorKey: "avatar",
        header: "Avatar",
        enableSorting: false,
        cell: (info) => (
          <img
            src={info.getValue() as string}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: (info) => (
          <div className="flex gap-2">
            <button 
              onClick={() => handleEdit(info.row.original)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              수정
            </button>
            <button 
              onClick={() => handleDelete(info.row.original)}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              삭제
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // TanStack Table 인스턴스 생성 (manualPagination 옵션 사용)
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: data ? Math.ceil(data.total / pageSize) : 0,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newPagination.pageIndex);
      setPageSize(newPagination.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleEdit = (row: DataItem) => {
    alert('Edit clicked for:' + row.email);
    // 여기에 수정 로직 구현
  };

  const handleDelete = (row: DataItem) => {
    alert('Delete clicked for:' + row.email);
    // 여기에 삭제 로직 구현
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 font-medium">
          데이터 불러오기 실패: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`border border-gray-200 p-2 bg-gray-50  ${
                    header.column.getCanSort()
                      ? "cursor-pointer select-none hover:bg-gray-100"
                      : ""
                  }`}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center justify-between">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <span className="ml-2">
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted() as string] ?? null}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border border-gray-200 p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 UI */}
      <div className="mt-4 flex items-center gap-2">
        <button
          className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
          onClick={() => setPageIndex(0)}
          disabled={pageIndex === 0}
        >
          {"<<"}
        </button>
        <button
          className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
          onClick={() => setPageIndex((old) => Math.max(old - 1, 0))}
          disabled={pageIndex === 0}
        >
          {"<"}
        </button>
        <span className="mx-2">
          페이지 <strong>{pageIndex + 1}</strong> /{" "}
          <strong>{table.getPageCount()}</strong>
        </span>
        <button
          className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
          onClick={() =>
            setPageIndex((old) => Math.min(old + 1, table.getPageCount() - 1))
          }
          disabled={pageIndex >= table.getPageCount() - 1}
        >
          {">"}
        </button>
        <button
          className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
          onClick={() => setPageIndex(table.getPageCount() - 1)}
          disabled={pageIndex >= table.getPageCount() - 1}
        >
          {">>"}
        </button>
      </div>
    </div>
  );
};

export default App;
