import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { PageSection } from "@patternfly/react-core";

import { AnalysisDetailsAttachmentRoute, Paths } from "@app/Paths";
import { PageHeader } from "@app/components/PageHeader";
import { formatPath } from "@app/utils/utils";
import {
  DocumentId,
  SimpleDocumentViewer,
} from "@app/components/simple-document-viewer";
import { useFetchApplicationById } from "@app/queries/applications";
import { useFetchTaskByID } from "@app/queries/tasks";

export const AnalysisDetails: React.FC = () => {
  const { t } = useTranslation();

  const { applicationId, taskId, attachmentId } =
    useParams<AnalysisDetailsAttachmentRoute>();

  const history = useHistory();
  const onDocumentChange = (documentId: DocumentId) =>
    typeof documentId === "number"
      ? history.push(
          formatPath(Paths.applicationsAnalysisDetailsAttachment, {
            applicationId: applicationId,
            taskId: taskId,
            attachmentId: documentId,
          })
        )
      : history.push(
          formatPath(Paths.applicationsAnalysisDetails, {
            applicationId: applicationId,
            taskId: taskId,
          })
        );

  const { application } = useFetchApplicationById(applicationId);
  const { task } = useFetchTaskByID(Number(taskId));

  const taskName = task?.name ?? t("terms.unknown");
  const appName: string = application?.name ?? t("terms.unknown");
  const attachmentName = task?.attached?.find(
    ({ id }) => String(id) === attachmentId
  )?.name;

  return (
    <>
      <PageSection variant="light">
        <PageHeader
          title={`Analysis details for ${taskName}`}
          breadcrumbs={[
            {
              title: t("terms.applications"),
              path: Paths.applications,
            },
            {
              title: appName,
              path: `${Paths.applications}/?activeItem=${applicationId}`,
            },
            {
              title: t("actions.analysisDetails"),
              path: formatPath(Paths.applicationsAnalysisDetails, {
                applicationId: applicationId,
                taskId: taskId,
              }),
            },
            ...(attachmentName
              ? [
                  {
                    title: t("terms.attachments"),
                  },
                  {
                    title: attachmentName,
                    path: formatPath(Paths.applicationsAnalysisDetails, {
                      applicationId: applicationId,
                      taskId: taskId,
                      attachment: attachmentId,
                    }),
                  },
                ]
              : []),
          ]}
        />
      </PageSection>
      <PageSection className="simple-task-viewer-container">
        <SimpleDocumentViewer
          // force re-creating viewer via keys
          key={`${task?.id}/${task?.attached?.length}`}
          taskId={task ? Number(taskId) : undefined}
          attachmentId={attachmentName ? Number(attachmentId) : undefined}
          attachments={task?.attached ?? []}
          onDocumentChange={onDocumentChange}
          height="full"
        />
      </PageSection>
    </>
  );
};
