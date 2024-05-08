import * as React from "react";
import {
  Badge,
  Button,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  ToolbarChip,
  ToolbarFilter,
  Tooltip,
} from "@patternfly/react-core";
import { IFilterControlProps } from "./FilterControl";
import {
  FilterSelectOptionProps,
  IMultiselectFilterCategory,
} from "./FilterToolbar";
import { css } from "@patternfly/react-styles";
import { TimesIcon } from "@patternfly/react-icons";

import "./select-overrides.css";

export interface IMultiselectFilterControlProps<TItem>
  extends IFilterControlProps<TItem, string> {
  category: IMultiselectFilterCategory<TItem, string>;
  isScrollable?: boolean;
}

const NO_RESULTS = "no-results";

export const MultiselectFilterControl = <TItem,>({
  category,
  filterValue,
  setFilterValue,
  showToolbarItem,
  isDisabled = false,
  isScrollable = false,
}: React.PropsWithChildren<
  IMultiselectFilterControlProps<TItem>
>): JSX.Element | null => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>("");
  const textInputRef = React.useRef<HTMLInputElement>();

  const idPrefix = `filter-control-${category.categoryKey}`;
  const withPrefix = (id: string) => `${idPrefix}-${id}`;

  const filteredOptions = category.selectOptions?.filter(({ label, value }) =>
    String(label ?? value ?? "")
      .toLowerCase()
      .includes(inputValue?.trim().toLowerCase() ?? "")
  );
  const onFilterClearAll = () => setFilterValue([]);
  const onFilterClear = (chip: string | ToolbarChip) => {
    const value = typeof chip === "string" ? chip : chip.key;

    if (value) {
      const newValue = filterValue?.filter((val) => val !== value) ?? [];
      setFilterValue(newValue.length > 0 ? newValue : null);
    }
  };

  /*
   * Note: Create chips only as `ToolbarChip` (no plain string)
   */
  const chips = filterValue
    ?.map((filter) =>
      category.selectOptions.find(({ value }) => value === filter)
    )
    .filter(Boolean)
    .map((option) => {
      const { chipLabel, label, groupLabel, value } = option;
      const displayValue: string = chipLabel ?? label ?? value ?? "";

      return {
        key: value,
        node: groupLabel ? (
          <Tooltip content={<div>{groupLabel}</div>}>
            <div>{displayValue}</div>
          </Tooltip>
        ) : (
          displayValue
        ),
      };
    });

  const onSelect = (value: string | undefined) => {
    if (!value || value === NO_RESULTS) {
      return;
    }

    const newFilterValue: string[] = filterValue?.includes(value)
      ? filterValue.filter((item) => item !== value)
      : [...(filterValue ?? []), value];

    setFilterValue(newFilterValue);
    textInputRef.current?.focus();
  };

  const {
    focusedItemIndex,
    getFocusedItem,
    clearFocusedItemIndex,
    moveFocusedItemIndex,
  } = useFocusHandlers({
    filteredOptions,
  });

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "Enter":
        if (!isFilterDropdownOpen) {
          setIsFilterDropdownOpen(true);
        } else {
          setInputValue("");
          onSelect(getFocusedItem()?.value);
        }
        break;
      case "Tab":
      case "Escape":
        setIsFilterDropdownOpen(false);
        clearFocusedItemIndex();
        break;
      case "ArrowUp":
      case "ArrowDown":
        event.preventDefault();
        if (isFilterDropdownOpen) {
          moveFocusedItemIndex(event.key);
        } else {
          setIsFilterDropdownOpen(true);
        }
        break;
      default:
        break;
    }
  };

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    setInputValue(value);
    if (!isFilterDropdownOpen) {
      setIsFilterDropdownOpen(true);
    }
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={() => {
        setIsFilterDropdownOpen(!isFilterDropdownOpen);
      }}
      isExpanded={isFilterDropdownOpen}
      isDisabled={isDisabled || !category.selectOptions.length}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={() => {
            setIsFilterDropdownOpen(!isFilterDropdownOpen);
          }}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id={withPrefix("typeahead-select-input")}
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={category.placeholderText}
          aria-activedescendant={
            getFocusedItem()
              ? withPrefix(`option-${focusedItemIndex}`)
              : undefined
          }
          role="combobox"
          isExpanded={isFilterDropdownOpen}
          aria-controls={withPrefix("select-typeahead-listbox")}
        />

        <TextInputGroupUtilities>
          {!!inputValue && (
            <Button
              variant="plain"
              onClick={() => {
                setInputValue("");
                textInputRef?.current?.focus();
              }}
              aria-label="Clear input value"
            >
              <TimesIcon aria-hidden />
            </Button>
          )}
          {filterValue?.length ? (
            <Badge isRead>{filterValue.length}</Badge>
          ) : null}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <ToolbarFilter
      id={idPrefix}
      chips={chips}
      deleteChip={(_, chip) => onFilterClear(chip)}
      deleteChipGroup={onFilterClearAll}
      categoryName={category.title}
      showToolbarItem={showToolbarItem}
    >
      <Select
        className={css(isScrollable && "isScrollable")}
        aria-label={category.title}
        toggle={toggle}
        selected={filterValue}
        onOpenChange={(isOpen) => setIsFilterDropdownOpen(isOpen)}
        onSelect={(_, selection) => onSelect(selection as string)}
        isOpen={isFilterDropdownOpen}
      >
        <SelectList id={withPrefix("select-typeahead-listbox")}>
          {[
            ...filteredOptions.map(
              ({ label, value, optionProps = {} }, index) => (
                <SelectOption
                  {...optionProps}
                  {...(!optionProps.isDisabled && { hasCheckbox: true })}
                  key={value}
                  id={withPrefix(`option-${index}`)}
                  value={value}
                  isFocused={focusedItemIndex === index}
                  isSelected={filterValue?.includes(value)}
                >
                  {label ?? value}
                </SelectOption>
              )
            ),
            !filteredOptions.length && (
              <SelectOption
                isDisabled
                hasCheckbox={false}
                key={NO_RESULTS}
                value={NO_RESULTS}
                isSelected={false}
              >
                {`No results found for "${inputValue}"`}
              </SelectOption>
            ),
          ].filter(Boolean)}
        </SelectList>
      </Select>
    </ToolbarFilter>
  );
};

const useFocusHandlers = ({
  filteredOptions,
}: {
  filteredOptions: FilterSelectOptionProps[];
}) => {
  const [focusedItemIndex, setFocusedItemIndex] = React.useState<number>(-1);

  const moveFocusedItemIndex = (key: string) =>
    setFocusedItemIndex(calculateFocusedItemIndex(key));

  const calculateFocusedItemIndex = (key: string): number => {
    if (!filteredOptions.length) {
      return -1;
    }

    if (key === "ArrowUp") {
      return focusedItemIndex <= 0
        ? filteredOptions.length - 1
        : focusedItemIndex - 1;
    }

    if (key === "ArrowDown") {
      return focusedItemIndex >= filteredOptions.length - 1
        ? 0
        : focusedItemIndex + 1;
    }
    return -1;
  };

  const getFocusedItem = () =>
    filteredOptions[focusedItemIndex] &&
    !filteredOptions[focusedItemIndex]?.optionProps?.isDisabled
      ? filteredOptions[focusedItemIndex]
      : undefined;

  return {
    moveFocusedItemIndex,
    focusedItemIndex,
    getFocusedItem,
    clearFocusedItemIndex: () => setFocusedItemIndex(-1),
  };
};
