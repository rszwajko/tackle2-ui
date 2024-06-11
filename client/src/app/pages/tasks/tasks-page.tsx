import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import {
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import { Table, Tbody, Th, Thead, Tr, Td } from "@patternfly/react-table";
import { CubesIcon } from "@patternfly/react-icons";

import { FilterToolbar, FilterType } from "@app/components/FilterToolbar";
import {
  ConditionalTableBody,
  TableHeaderContentWithControls,
  TableRowContentWithControls,
} from "@app/components/TableControls";
import {
  deserializeFilterUrlParams,
  getHubRequestParams,
  useTableControlProps,
  useTableControlState,
} from "@app/hooks/table-controls";

import { SimplePagination } from "@app/components/SimplePagination";
import { TablePersistenceKeyPrefix } from "@app/Constants";

import { useSelectionState } from "@migtools/lib-ui";
import { useServerTasks } from "@app/queries/tasks";

export const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const urlParams = new URLSearchParams(window.location.search);
  const filters = urlParams.get("filters") ?? "";

  const deserializedFilterValues = deserializeFilterUrlParams({ filters });

  const tableControlState = useTableControlState({
    tableName: "tasks-table",
    persistTo: { filter: "urlParams" },
    persistenceKeyPrefix: TablePersistenceKeyPrefix.tasks,
    columnNames: {
      id: "ID",
      state: "State",
      application: "Application",
      kind: "Kind",
    },
    initialFilterValues: deserializedFilterValues,
    isFilterEnabled: true,
    isSortEnabled: true,
    isPaginationEnabled: true,
    isActiveItemEnabled: true,
    sortableColumns: ["id", "state", "application", "kind"],
    initialSort: { columnKey: "id", direction: "desc" },
    filterCategories: [
      {
        categoryKey: "id",
        title: "ID",
        type: FilterType.search,
        placeholderText: t("actions.filterBy", {
          what: "ID...",
        }),
        getServerFilterValue: (value) => (value ? value : []),
      },
      {
        categoryKey: "state",
        title: "State",
        type: FilterType.search,
        placeholderText: t("actions.filterBy", {
          what: "State...",
        }),
        getServerFilterValue: (value) => (value ? [`*${value[0]}*`] : []),
      },
      {
        categoryKey: "application",
        title: "Application",
        type: FilterType.search,
        placeholderText: t("actions.filterBy", {
          what: "Application...",
        }),
        serverFilterField: "application.id",
        getServerFilterValue: (value) => (value ? [`*${value[0]}*`] : []),
      },
      {
        categoryKey: "kind",
        title: "Kind",
        type: FilterType.search,
        placeholderText: t("actions.filterBy", {
          what: "Kind...",
        }),
        getServerFilterValue: (value) => (value ? [`*${value[0]}*`] : []),
      },
    ],
    initialItemsPerPage: 10,
  });

  const {
    result: { data: currentPageItems = [], total: totalItemCount },
    isFetching,
    fetchError,
  } = useServerTasks(
    getHubRequestParams({
      ...tableControlState,
      hubSortFieldKeys: {
        id: "id",
        state: "state",
        application: "application.id",
        kind: "kind",
      },
    })
  );

  const tableControls = useTableControlProps({
    ...tableControlState,
    // task.id is defined as optional
    idProperty: "name",
    currentPageItems,
    totalItemCount,
    isLoading: isFetching,
    selectionState: useSelectionState({
      items: currentPageItems,
      isEqual: (a, b) => a.name === b.name,
    }),
  });

  const {
    numRenderedColumns,
    propHelpers: {
      toolbarProps,
      filterToolbarProps,
      paginationToolbarItemProps,
      paginationProps,
      tableProps,
      getThProps,
      getTrProps,
      getTdProps,
    },
  } = tableControls;

  const clearFilters = () => {
    const currentPath = history.location.pathname;
    const newSearch = new URLSearchParams(history.location.search);
    newSearch.delete("filters");
    history.push(`${currentPath}`);
    filterToolbarProps.setFilterValues({});
  };

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">{t("titles.taskManager")}</Text>
        </TextContent>
      </PageSection>
      <PageSection>
        <div
          style={{
            backgroundColor: "var(--pf-v5-global--BackgroundColor--100)",
          }}
        >
          <Toolbar {...toolbarProps} clearAllFilters={clearFilters}>
            <ToolbarContent>
              <FilterToolbar {...filterToolbarProps} />
              <ToolbarItem {...paginationToolbarItemProps}>
                <SimplePagination
                  idPrefix="tasks-table"
                  isTop
                  paginationProps={paginationProps}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>

          <Table {...tableProps} id="tasks-table" aria-label="Tasks table">
            <Thead>
              <Tr>
                <TableHeaderContentWithControls {...tableControls}>
                  <Th {...getThProps({ columnKey: "id" })} />
                  <Th {...getThProps({ columnKey: "state" })} />
                  <Th {...getThProps({ columnKey: "application" })} />
                  <Th {...getThProps({ columnKey: "kind" })} />
                </TableHeaderContentWithControls>
              </Tr>
            </Thead>
            <ConditionalTableBody
              isLoading={isFetching}
              isError={!!fetchError}
              isNoData={currentPageItems.length === 0}
              noDataEmptyState={
                <EmptyState variant="sm">
                  <EmptyStateHeader
                    titleText="No tasks found"
                    headingLevel="h2"
                    icon={<EmptyStateIcon icon={CubesIcon} />}
                  />
                </EmptyState>
              }
              numRenderedColumns={numRenderedColumns}
            >
              <Tbody>
                {currentPageItems?.map((task, rowIndex) => (
                  <Tr key={task.id} {...getTrProps({ item: task })}>
                    <TableRowContentWithControls
                      {...tableControls}
                      item={task}
                      rowIndex={rowIndex}
                    >
                      <Td {...getTdProps({ columnKey: "id" })}>{task.id}</Td>
                      <Td {...getTdProps({ columnKey: "state" })}>
                        {task.state}
                      </Td>
                      <Td {...getTdProps({ columnKey: "application" })}>
                        {task.application.name ?? task.application.id}
                      </Td>
                      <Td {...getTdProps({ columnKey: "kind" })}>kind?</Td>
                    </TableRowContentWithControls>
                  </Tr>
                ))}
              </Tbody>
            </ConditionalTableBody>
          </Table>
          <SimplePagination
            idPrefix="dependencies-table"
            isTop={false}
            paginationProps={paginationProps}
          />
        </div>
      </PageSection>
    </>
  );
};

export default TasksPage;
