import React, { SyntheticEvent } from "react";
import { Bullseye, Spinner, Skeleton } from "@patternfly/react-core";
import { IRow } from "@patternfly/react-table";
import {
  Table as Table4,
  TableHeader as TableHeader4,
  TableBody as TableBody4,
  TableProps as TableProps4,
} from "@patternfly/react-table/deprecated";
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ThProps,
  SortByDirection,
  ActionsColumn,
} from "@patternfly/react-table";
import { StateNoData } from "./StateNoData";
import { StateNoResults } from "./StateNoResults";
import { StateError } from "./StateError";
import { Application } from "@app/api/models";
import { handlePropagatedRowClick } from "@app/hooks/table-controls";
import "./AppTable.css";

const ENTITY_FIELD = "entity";

export interface IAppTableProps extends TableProps4 {
  isLoading: boolean;
  loadingVariant?: "skeleton" | "spinner" | "none";
  fetchError?: any;

  filtersApplied?: boolean;
  noDataState?: any;
  noSearchResultsState?: any;
  errorState?: any;
  onAppClick?: (application: Application) => void;
  onSort?: (
    event: SyntheticEvent,
    index: number,
    direction: SortByDirection
  ) => void;
  canSelectAll?: boolean;
  onSelect?: any;
  actionResolver?: any;
}

export const AppTable: React.FC<IAppTableProps> = ({
  cells,
  rows,
  "aria-label": ariaLabel = "main-table",

  isLoading,
  fetchError,
  loadingVariant = "skeleton",

  filtersApplied,
  noDataState,
  noSearchResultsState,
  errorState,

  onAppClick,
  onSort = () => {},
  onSelect,
  actionResolver = () => {},
  ...rest
}) => {
  // Index of the currently sorted column
  const [activeSortIndex, setActiveSortIndex] = React.useState<
    number | undefined
  >(undefined);

  // Sort direction of the currently sorted column
  const [activeSortDirection, setActiveSortDirection] = React.useState<
    "asc" | "desc" | undefined
  >(undefined);

  const getSortParams = (columnIndex: number): ThProps["sort"] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
    },
    onSort: (
      _event: SyntheticEvent,
      index: number,
      direction: SortByDirection
    ) => {
      onSort(_event, index, direction);
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  if (isLoading && loadingVariant !== "none") {
    let rows: IRow[] = [];
    if (loadingVariant === "skeleton") {
      rows = [...Array(3)].map(() => {
        return {
          cells: [...Array(cells.length)].map(() => ({
            title: <Skeleton />,
          })),
        };
      });
    } else if (loadingVariant === "spinner") {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 8 },
              title: (
                <Bullseye>
                  <Spinner size="xl" />
                </Bullseye>
              ),
            },
          ],
        },
      ];
    } else {
      throw new Error("Can not determine the loading state of table");
    }

    return (
      <>
        <h1>App inventory analysis isloading</h1>
        <Table4
          className="app-table"
          aria-label={ariaLabel}
          cells={cells}
          rows={rows}
        >
          <TableHeader4 />
          <TableBody4 />
        </Table4>
      </>
    );
  }

  if (fetchError) {
    return (
      <>
        <h1>AppTable app inv analysis error</h1>
        <Table4 aria-label={ariaLabel} cells={cells} rows={[]}>
          <TableHeader4 />
          <TableBody4 />
        </Table4>
        {errorState ? errorState : <StateError />}
      </>
    );
  }

  if (rows.length === 0) {
    return filtersApplied ? (
      <>
        <h1>Apptable app inventory analysis empty with filters</h1>
        <Table4
          className="app-table"
          aria-label={ariaLabel}
          cells={cells}
          rows={[]}
        >
          <TableHeader4 />
          <TableBody4 />
        </Table4>
        {noSearchResultsState ? noSearchResultsState : <StateNoResults />}
      </>
    ) : (
      <>
        <h1>Apptable app inventory analysis empty without filters</h1>
        <Table4
          className="app-table"
          aria-label={ariaLabel}
          cells={cells}
          rows={[]}
        >
          <TableHeader4 />
          <TableBody4 />
        </Table4>
        {noDataState ? noDataState : <StateNoData />}
      </>
    );
  }
  console.log({ cells, rows, rest });
  return (
    <>
      <h1>AppTable App Inventory Analysis normal</h1>
      <Table className="app-table" aria-label={ariaLabel}>
        <Thead>
          <Tr>
            {onSelect && <Th />}
            {cells.map((c: any, index: number) => {
              index += onSelect ? 1 : 0;
              return (
                <Th
                  key={c.title}
                  sort={c.options?.sortable && getSortParams(index)}
                  width={c.options?.width}
                  modifier={c.options?.nowrap || c.options?.fitContent}
                >
                  {c.title}
                </Th>
              );
            })}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((r: any, index: number) => {
            const actions = actionResolver(r);
            return (
              <Tr
                key={"row" + index}
                isClickable={r.isClickable}
                isRowSelected={r.isRowSelected}
                onRowClick={(event) => {
                  handlePropagatedRowClick(event, () => {
                    onAppClick?.(r[ENTITY_FIELD] || null);
                  });
                }}
              >
                {onSelect && (
                  <Td
                    select={{
                      rowIndex: index,
                      onSelect: (event: any, isSelecting: boolean) =>
                        onSelect(event, isSelecting, index, r),
                      isSelected: r.selected,
                      isDisabled: !r.isClickable,
                    }}
                  />
                )}
                {r.cells.map((c: any, index: number) => (
                  <Td isActionCell={c.options?.isActionCell}>{c.title}</Td>
                ))}
                <Td isActionCell>
                  {actions && <ActionsColumn items={actions} />}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <Table4
        className="app-table"
        aria-label={ariaLabel}
        cells={cells}
        rows={rows}
        onSort={onSort}
        onSelect={onSelect}
        actionResolver={actionResolver}
        {...rest}
      >
        <TableHeader4 />
        <TableBody4
          onRowClick={(event, row) => {
            handlePropagatedRowClick(event, () => {
              onAppClick?.(row[ENTITY_FIELD] || null);
            });
          }}
        />
      </Table4>
    </>
  );
};
