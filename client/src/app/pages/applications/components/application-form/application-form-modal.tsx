import * as React from "react";
import { Modal } from "@patternfly/react-core";
import { ApplicationForm, useApplicationFormHook } from "./application-form";
import { Application } from "@app/api/models";
import { useTranslation } from "react-i18next";

export interface ApplicationFormModalProps {
  application: Application | null;
  onClose: () => void;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  application,
  onClose,
}) => {
  const { t } = useTranslation();
  const formProps = useApplicationFormHook({ application, onClose });
  const footerRef = React.useRef<HTMLDivElement>(null);
  return (
    <Modal
      title={
        application
          ? t("dialog.title.updateApplication")
          : t("dialog.title.newApplication")
      }
      variant="medium"
      isOpen={true}
      onClose={onClose}
      footer={<div ref={footerRef} />}
    >
      <ApplicationForm
        {...formProps}
        actionsContainer={footerRef.current}
        application={application}
        onClose={onClose}
      />
    </Modal>
  );
};
