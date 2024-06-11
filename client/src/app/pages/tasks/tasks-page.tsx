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
import { TaskAppsDetailDrawer } from "./TaskAppsDetailDrawer";

export const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const urlParams = new URLSearchParams(window.location.search);
  const filters = urlParams.get("filters") ?? "";

  const deserializedFilterValues = deserializeFilterUrlParams({ filters });

  const tableControlState = useTableControlState({
    tableName: "tasks-table",
    persistTo: { filter: "urlParams", activeItem: "urlParams" },
    persistenceKeyPrefix: TablePersistenceKeyPrefix.tasks,
    columnNames: {
      id: "ID",
      state: "State",
      // application: "Application",
    },
    initialFilterValues: deserializedFilterValues,
    isFilterEnabled: true,
    isSortEnabled: true,
    isPaginationEnabled: true,
    isActiveItemEnabled: true,
    sortableColumns: ["id", "state"],
    initialSort: { columnKey: "id", direction: "asc" },
    filterCategories: [
      {
        categoryKey: "id",
        title: "ID",
        type: FilterType.search,
        placeholderText: t("actions.filterBy", {
          what: "ID...",
        }),
        getServerFilterValue: (value) => (value ? [`*${value[0]}*`] : []),
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
    activeItemDerivedState: { activeItem, clearActiveItem },
  } = tableControls;

  // const token = keycloak.tokenParsed;
  // const userScopes: string[] = token?.scope.split(" ") || [],
  //   archetypeWriteAccess = checkAccess(userScopes, archetypesWriteScopes),
  //   assessmentWriteAccess = checkAccess(userScopes, assessmentWriteScopes),
  //   reviewsWriteAccess = checkAccess(userScopes, reviewsWriteScopes);

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
                  {/* <Th {...getThProps({ columnKey: "application" })} /> */}
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
                      <Td width={25} {...getTdProps({ columnKey: "id" })}>
                        {task.id}
                      </Td>
                      <Td width={25} {...getTdProps({ columnKey: "state" })}>
                        {task.state}
                      </Td>
                      {/* <Td
                        width={25}
                        {...getTdProps({ columnKey: "application" })}
                      >
                        {task.application.name}
                      </Td> */}
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

      <TaskAppsDetailDrawer
        task={activeItem ?? undefined}
        onCloseClick={() => clearActiveItem()}
      />
    </>
  );
};

export default TasksPage;
