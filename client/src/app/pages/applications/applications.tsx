import React, { lazy } from "react";
import {
  Level,
  LevelItem,
  PageSection,
  PageSectionVariants,
  Title,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { ApplicationForm } from "./components/application-form";

const ApplicationsTable = lazy(() => import("./applications-table"));

export const Applications: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Level>
          <LevelItem>
            <Title headingLevel="h1">New application</Title>
          </LevelItem>
        </Level>
      </PageSection>
      <ApplicationForm application={null} onClose={() => {}} />
    </>
  );
};
