import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  TextContent,
  Text,
  Title,
  Tabs,
  TabTitleText,
  Tab,
} from "@patternfly/react-core";
import spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";

import { Task } from "@app/api/models";
import { PageDrawerContent } from "@app/components/PageDrawerContext";
import { StateNoData } from "@app/components/StateNoData";

enum TabKey {
  Applications = 0,
}

export const TaskAppsDetailDrawer: React.FC<{
  task?: Task;
  onCloseClick: () => void;
}> = ({ task, onCloseClick }) => {
  const { t } = useTranslation();

  const [activeTabKey, setActiveTabKey] = React.useState<TabKey>(
    TabKey.Applications
  );

  return (
    <PageDrawerContent
      isExpanded={!!task}
      onCloseClick={onCloseClick}
      focusKey={task?.name}
      pageKey="tasks-page"
      drawerPanelContentProps={{ defaultSize: "600px" }}
      header={
        <TextContent>
          <Text component="small" className={spacing.mb_0}>
            Task
          </Text>
          <Title headingLevel="h2" size="lg" className={spacing.mtXs}>
            {task?.name || ""} /{" "}
          </Title>
        </TextContent>
      }
    >
      {!task ? (
        <StateNoData />
      ) : (
        <div>
          <Tabs
            activeKey={activeTabKey}
            onSelect={(_event, tabKey) => setActiveTabKey(tabKey as TabKey)}
          >
            <Tab
              eventKey={TabKey.Applications}
              title={<TabTitleText>Applications</TabTitleText>}
            >
              {t("terms.tasks")}
            </Tab>
          </Tabs>
        </div>
      )}
    </PageDrawerContent>
  );
};
