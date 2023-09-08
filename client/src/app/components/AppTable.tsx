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
  ExpandableRowContent,
} from "@patternfly/react-table";
import { StateNoData } from "./StateNoData";
import { StateNoResults } from "./StateNoResults";
import { StateError } from "./StateError";
import { Application } from "@app/api/models";
import { handlePropagatedRowClick } from "@app/hooks/table-controls";
import "./AppTable.css";

const ENTITY_FIELD = "entity";

export interface IAppTableProps extends TableProps4 {
  rows: any;
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
  onCollapse?: any;
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
  onCollapse,
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
        <h1>AppTable isloading</h1>
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
        <h1>AppTable error</h1>
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
        <h1>Apptable app empty with filters</h1>
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
        <h1>Apptable app empty without filters</h1>
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
  const extraColumns = (onSelect ? 1 : 0) + (onCollapse ? 1 : 0);
  return (
    <>
      <h1>AppTable App normal</h1>
      <Table className="app-table" aria-label={ariaLabel}>
        <Thead>
          <Tr>
            {onSelect && <Th />}
            {onCollapse && <Th />}
            {cells.map((c: any, index: number) => {
              index += extraColumns;
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
          {rows.map((r: any, rowIndex: number) => {
            const actions = actionResolver(r);
            if (Object.prototype.hasOwnProperty.call(r, "parent")) {
              return (
                <Tr key={"row" + rowIndex} isExpanded={rows[r.parent].isOpen}>
                  {r.cells.map((c: any, cellIndex: number) => (
                    <Td
                      colSpan={rows[r.parent].cells.length + extraColumns}
                      key={rowIndex + "-" + cellIndex}
                      isActionCell={c.options?.isActionCell}
                    >
                      <ExpandableRowContent>{c.title}</ExpandableRowContent>
                    </Td>
                  ))}
                </Tr>
              );
            } else {
              return (
                <Tr
                  key={"row" + rowIndex}
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
                      key={rowIndex + "-select"}
                      select={{
                        rowIndex,
                        onSelect: (event: any, isSelecting: boolean) =>
                          onSelect(event, isSelecting, rowIndex, r),
                        isSelected: r.selected,
                        isDisabled: !r.isClickable,
                      }}
                    />
                  )}
                  {onCollapse && (
                    <Td
                      key={rowIndex + "-expand"}
                      expand={{
                        rowIndex: rowIndex,
                        isExpanded: r.isOpen,
                        onToggle: () =>
                          onCollapse(undefined, rowIndex, r.isExpanded, r),
                      }}
                    />
                  )}
                  {r.cells.map((c: any, cellIndex: number) => (
                    <Td
                      key={rowIndex + "-" + cellIndex}
                      isActionCell={c.options?.isActionCell}
                    >
                      {c.title}
                    </Td>
                  ))}
                  <Td key={rowIndex + "-actionCell"} isActionCell>
                    {actions && <ActionsColumn items={actions} />}
                  </Td>
                </Tr>
              );
            }
          })}
        </Tbody>
      </Table>
    </>
  );
};
