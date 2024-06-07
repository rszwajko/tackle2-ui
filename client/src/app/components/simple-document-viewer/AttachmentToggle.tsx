import React, { FC, useState } from "react";

import {
  Select,
  SelectOption,
  SelectList,
  MenuToggleElement,
  MenuToggle,
} from "@patternfly/react-core";
import { Document } from "./SimpleDocumentViewer";
import "./SimpleDocumentViewer.css";

export const AttachmentToggle: FC<{
  onSelect: (doc: Document) => void;
  documents: Document[];
}> = ({ onSelect, documents }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="simple-task-viewer-attachment-toggle">
      <Select
        isOpen={isOpen}
        onSelect={(_event, value: string | number | undefined) => {
          const selected = documents.find((it) => it.id === value);
          if (selected) {
            onSelect(selected);
          }
          onToggle();
        }}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle ref={toggleRef} onClick={onToggle} isExpanded={isOpen}>
            {documents.find(({ isSelected }) => isSelected)?.name}
          </MenuToggle>
        )}
        shouldFocusToggleOnSelect
      >
        <SelectList>
          {documents.map(({ id, name, isSelected, description }) => (
            <SelectOption
              isSelected={isSelected}
              key={id}
              value={id}
              description={description}
            >
              {name}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </div>
  );
};
