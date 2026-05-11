import { useRef, useState } from "react"
import type { Key, ReactNode } from "react"

import { Combobox } from "@base-ui/react/combobox"

import { InfiniteList } from "@/shared/ui/infinite-list"

type InfiniteComboboxCommonProps<TItem> = {
  items: readonly TItem[]
  hasMore: boolean
  isLoading: boolean
  isFetchingNextPage: boolean
  isRefreshing?: boolean
  onLoadMore: () => void
  search: string
  onSearchChange: (value: string) => void
  itemToStringLabel: (item: TItem) => string
  itemToStringValue: (item: TItem) => string
  isItemEqualToValue: (item: TItem, value: TItem) => boolean
  renderItem: (item: TItem, index: number) => ReactNode
  getItemKey: (item: TItem, index: number) => Key
  loadingState?: ReactNode
  refreshState?: ReactNode
  emptyState?: ReactNode
  endState?: ReactNode
  loadMoreLabel: ReactNode
  loadingLabel: string
  placeholder: ReactNode
  searchPlaceholder: string
  triggerLabel: string
  className?: string
  triggerClassName?: string
  popupClassName?: string
  inputClassName?: string
  listClassName?: string
  footerClassName?: string
  observeRoot?: Element | null
  disabled?: boolean
}

type InfiniteComboboxProps<TItem> = InfiniteComboboxCommonProps<TItem> & {
  multiple: boolean
  value: TItem | readonly TItem[] | null
  onValueChange: (value: TItem | readonly TItem[] | null) => void
}

type InfiniteSelectProps<TItem> = InfiniteComboboxCommonProps<TItem> & {
  value: TItem | null
  onValueChange: (value: TItem | null) => void
}

type InfiniteMultiSelectProps<TItem> = InfiniteComboboxCommonProps<TItem> & {
  value: readonly TItem[]
  onValueChange: (value: readonly TItem[]) => void
}

function InfiniteComboboxBase<TItem>({
  multiple,
  value,
  onValueChange,
  items,
  hasMore,
  isLoading,
  isFetchingNextPage,
  isRefreshing = false,
  onLoadMore,
  search,
  onSearchChange,
  itemToStringLabel,
  itemToStringValue,
  isItemEqualToValue,
  renderItem,
  getItemKey,
  loadingState,
  refreshState,
  emptyState,
  endState,
  loadMoreLabel,
  loadingLabel,
  placeholder,
  searchPlaceholder,
  triggerLabel,
  className,
  triggerClassName,
  popupClassName,
  inputClassName,
  listClassName,
  footerClassName,
  observeRoot = null,
  disabled,
}: InfiniteComboboxProps<TItem>) {
  const [popupElement, setPopupElement] = useState<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div className={className}>
      <Combobox.Root<TItem, boolean>
        multiple={multiple}
        value={value as never}
        onValueChange={(nextValue) => {
          onValueChange(nextValue as never)
        }}
        inputValue={search}
        onInputValueChange={onSearchChange}
        filter={null}
        itemToStringLabel={itemToStringLabel}
        itemToStringValue={itemToStringValue}
        isItemEqualToValue={isItemEqualToValue}
        disabled={disabled}
      >
        <Combobox.Trigger
          className={triggerClassName}
          aria-label={triggerLabel}
        >
          <Combobox.Value placeholder={placeholder} />
          <span aria-hidden="true" className="ml-2 shrink-0 text-muted-foreground">
            ▾
          </span>
        </Combobox.Trigger>

        <Combobox.Portal>
          <Combobox.Positioner
            className="isolate z-50"
            side="bottom"
            sideOffset={4}
            align="start"
          >
            <Combobox.Popup
              ref={setPopupElement}
              initialFocus={inputRef}
              className={popupClassName}
            >
              <div className="flex flex-col gap-2 p-2">
                <Combobox.Input
                  ref={inputRef}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className={inputClassName}
                />

                <Combobox.List className="flex flex-col gap-2">
                  <InfiniteList
                    items={items}
                    hasMore={hasMore}
                    isLoading={isLoading}
                    isFetchingNextPage={isFetchingNextPage}
                    isRefreshing={isRefreshing}
                    onLoadMore={onLoadMore}
                    getItemKey={getItemKey}
                    renderItem={renderItem}
                    loadingLabel={loadingLabel}
                    loadMoreLabel={loadMoreLabel}
                    loadingState={loadingState}
                    refreshState={refreshState}
                    emptyState={emptyState}
                    endState={endState}
                    className="gap-2"
                    listClassName={listClassName}
                    footerClassName={footerClassName}
                    observeRoot={popupElement ?? observeRoot}
                  />
                </Combobox.List>
              </div>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  )
}

function InfiniteSelect<TItem>(props: InfiniteSelectProps<TItem>) {
  const baseProps: InfiniteComboboxProps<TItem> = {
    ...props,
    multiple: false,
    value: props.value,
    onValueChange: props.onValueChange as (
      value: TItem | readonly TItem[] | null,
    ) => void,
  }

  return (
    <InfiniteComboboxBase<TItem> {...baseProps} />
  )
}

function InfiniteMultiSelect<TItem>(props: InfiniteMultiSelectProps<TItem>) {
  const baseProps: InfiniteComboboxProps<TItem> = {
    ...props,
    multiple: true,
    value: props.value,
    onValueChange: props.onValueChange as (
      value: TItem | readonly TItem[] | null,
    ) => void,
  }

  return (
    <InfiniteComboboxBase<TItem> {...baseProps} />
  )
}

export {
  InfiniteMultiSelect,
  InfiniteSelect,
  type InfiniteMultiSelectProps,
  type InfiniteSelectProps,
}
