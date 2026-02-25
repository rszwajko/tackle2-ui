import * as React from "react";
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from "@patternfly/react-core";

export interface SimpleEmptyStateProps {
  icon?: any;
  title: string;
  description?: string;
  primaryAction?: any;
}

export const SimpleEmptyState: React.FC<SimpleEmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
}) => {
  return (
    <EmptyState variant={EmptyStateVariant.sm}>
      <EmptyStateHeader
        titleText={title}
        headingLevel="h2"
        icon={icon && <EmptyStateIcon icon={icon} />}
      />

      {description && <EmptyStateBody>{description}</EmptyStateBody>}
      <EmptyStateFooter>{primaryAction}</EmptyStateFooter>
    </EmptyState>
  );
};
