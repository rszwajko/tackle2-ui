import { Button, ToolbarItem } from "@patternfly/react-core";
import { AngleDownIcon, AngleRightIcon } from "@patternfly/react-icons";

export interface ITToolbarBulkExpanderProps {
  areAllExpanded?: boolean;
  onExpandAll?: (flag: boolean) => void;
  isExpandable?: boolean;
}

export const ToolbarBulkExpander = ({
  onExpandAll,
  areAllExpanded,
  isExpandable,
}: ITToolbarBulkExpanderProps): JSX.Element | null => {
  const toggleCollapseAll = (collapse: boolean) => {
    onExpandAll && onExpandAll(!collapse);
  };

  return !isExpandable ? null : (
    <ToolbarItem>
      <Button
        variant="control"
        title={`${!areAllExpanded ? "Expand" : "Collapse"} all`}
        onClick={() => {
          areAllExpanded !== undefined && toggleCollapseAll(areAllExpanded);
        }}
      >
        {areAllExpanded ? <AngleDownIcon /> : <AngleRightIcon />}
      </Button>
    </ToolbarItem>
  );
};
