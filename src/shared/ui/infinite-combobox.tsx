import { useRef, useState } from "react"
import type { Key, ReactNode } from "react"

import { Combobox } from "@base-ui/react/combobox"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/shared/lib/cn"
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
  renderItemContent: (item: TItem, index: number) => ReactNode
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
  renderItemContent,
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
  const [listElement, setListElement] = useState<HTMLDivElement | null>(null)
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
              className={cn("flex flex-col", popupClassName)}
            >
              <div className="flex min-h-0 flex-col gap-2 p-2">
                <Combobox.Input
                  ref={inputRef}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className={inputClassName}
                />

                <Combobox.List
                  ref={setListElement}
                  className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pr-1"
                >
                  <InfiniteList
                    items={items}
                    hasMore={hasMore}
                    isLoading={isLoading}
                    isFetchingNextPage={isFetchingNextPage}
                    isRefreshing={isRefreshing}
                    onLoadMore={onLoadMore}
                    getItemKey={getItemKey}
                    renderItem={(item, index) => (
                      <InfiniteComboboxItem value={item}>
                        {renderItemContent(item, index)}
                      </InfiniteComboboxItem>
                    )}
                    loadingLabel={loadingLabel}
                    loadMoreLabel={loadMoreLabel}
                    loadingState={loadingState}
                    refreshState={refreshState}
                    emptyState={emptyState}
                    endState={endState}
                    className="gap-2"
                    listClassName={listClassName}
                    footerClassName={footerClassName}
                    observeRoot={listElement ?? popupElement ?? observeRoot}
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

function InfiniteComboboxItem<TItem>({
  value,
  children,
}: {
  value: TItem
  children: ReactNode
}) {
  return (
    <Combobox.Item
      value={value}
      className="relative flex w-full cursor-default items-center gap-2.5 rounded-xl py-2 pr-8 pl-3 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
    >
      <span className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">{children}</span>
      <Combobox.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="pointer-events-none" />
      </Combobox.ItemIndicator>
    </Combobox.Item>
  )
}

export {
  InfiniteMultiSelect,
  InfiniteSelect,
  type InfiniteMultiSelectProps,
  type InfiniteSelectProps,
}
