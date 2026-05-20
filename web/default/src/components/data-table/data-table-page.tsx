/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  flexRender,
  type ColumnDef,
  type Row,
  type Table as TanstackTable,
} from '@tanstack/react-table'
import { useMediaQuery } from '@/hooks'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageFooterPortal } from '@/components/layout'
import { MobileCardList } from './mobile-card-list'
import { DataTablePagination } from './pagination'
import { TableEmpty } from './table-empty'
import { TableSkeleton } from './table-skeleton'
import { DataTableToolbar } from './toolbar'

/**
 * Pass-through configuration for the default {@link DataTableToolbar}.
 * Pass `toolbar` (ReactNode) instead to fully replace the default toolbar.
 */
export type DataTablePageToolbarProps<TData> = Omit<
  React.ComponentProps<typeof DataTableToolbar<TData>>,
  'table'
>

export type DataTablePageProps<TData> = {
  /**
   * TanStack Table instance returned from `useReactTable`.
   */
  table: TanstackTable<TData>

  /**
   * Column definitions. Used for skeleton column count and empty-state colSpan.
   */
  columns: ColumnDef<TData, unknown>[]

  /**
   * Initial loading state — renders {@link TableSkeleton} or mobile skeleton.
   */
  isLoading?: boolean

  /**
   * Refetch / background loading — dims the table without removing rows.
   */
  isFetching?: boolean

  /**
   * Empty-state title (used for both desktop {@link TableEmpty} and mobile fallback).
   */
  emptyTitle?: string

  /**
   * Empty-state description.
   */
  emptyDescription?: string

  /**
   * Empty-state icon override (desktop only; mobile uses default Database icon).
   */
  emptyIcon?: React.ReactNode

  /**
   * Empty-state extra content — e.g. a "Create" button below the message.
   */
  emptyAction?: React.ReactNode

  /**
   * Custom toolbar node — fully replaces the default {@link DataTableToolbar}.
   * Useful for layouts like "primary buttons + toolbar" or feature-specific filter cards.
   * If provided, `toolbarProps` is ignored.
   */
  toolbar?: React.ReactNode

  /**
   * Pass-through props for the default {@link DataTableToolbar}.
   * Ignored if `toolbar` is provided. Pass `null` to omit the toolbar entirely.
   */
  toolbarProps?: DataTablePageToolbarProps<TData> | null

  /**
   * Bulk action bar — typically a wrapped {@link DataTableBulkActions} component.
   * Rendered only on desktop (mobile selection is uncommon).
   */
  bulkActions?: React.ReactNode

  /**
   * Custom mobile list node — fully replaces the default {@link MobileCardList}.
   */
  mobile?: React.ReactNode

  /**
   * Pass-through props for the default {@link MobileCardList}.
   * Ignored if `mobile` is provided.
   */
  mobileProps?: {
    getRowKey?: (row: Row<TData>) => string | number
    getRowClassName?: (row: Row<TData>) => string | undefined
  }

  /**
   * Disable the mobile-specific layout entirely — always renders desktop table.
   * Useful for pages where the table is read-only and short.
   */
  hideMobile?: boolean

  /**
   * Row className resolver — applied to both desktop `TableRow` and mobile card.
   * Composes with the default `data-state="selected"` styling on desktop.
   * The `ctx.isMobile` flag is provided so consumers can return the
   * appropriate variant (e.g. `DISABLED_ROW_DESKTOP` vs `DISABLED_ROW_MOBILE`)
   * without having to re-call `useMediaQuery` themselves.
   */
  getRowClassName?: (
    row: Row<TData>,
    ctx: { isMobile: boolean }
  ) => string | undefined

  /**
   * Custom desktop row renderer — replaces the default `<TableRow>`/`<TableCell>` mapping.
   * Use for expanded rows, aggregate rows, click-on-row navigation, etc.
   */
  renderRow?: (row: Row<TData>) => React.ReactNode

  /**
   * Apply explicit column widths from `header.getSize()` to `<TableHead>`.
   * Enable this when your column definitions include `size` and you want it honored.
   * Off by default (TanStack Table assigns a default size of 150 to all columns
   * which would unintentionally constrain layouts that don't define sizes).
   */
  applyHeaderSize?: boolean

  /**
   * Optional skeleton key prefix for stable React keys across re-renders.
   */
  skeletonKeyPrefix?: string

  /**
   * Whether to render pagination. Defaults to `true`.
   */
  showPagination?: boolean

  /**
   * Render pagination via `PageFooterPortal` (sticks to page footer).
   * Defaults to `true`. Set `false` to render inline below the table.
   */
  paginationInFooter?: boolean

  /**
   * Extra content rendered between the table/mobile list and the pagination.
   * E.g. summary stats, helper text.
   */
  afterTable?: React.ReactNode

  /**
   * Outer wrapper className (applied to the toolbar+table column).
   */
  className?: string

  /**
   * Desktop table container className (the bordered scroll wrapper).
   */
  tableClassName?: string

  /**
   * Keep the table inside a viewport-height scroll area so the horizontal
   * scrollbar stays visible without scrolling past all rows.
   */
  tableViewportScroll?: boolean

  /**
   * Desktop `<TableHeader>` className override.
   * Useful for sticky headers (`'sticky top-0 z-10 bg-muted/30'`) on long lists.
   */
  tableHeaderClassName?: string
}

/**
 * Unified table page wrapper. Encapsulates the canonical structure used across
 * all list pages: toolbar → desktop table / mobile list → pagination, plus
 * loading/empty states and an opt-in bulk action bar.
 *
 * Most pages should be expressible as:
 * ```tsx
 * <DataTablePage
 *   table={table}
 *   columns={columns}
 *   isLoading={isLoading}
 *   isFetching={isFetching}
 *   emptyTitle={t('No X Found')}
 *   toolbarProps={{ searchPlaceholder: t('Filter...'), filters }}
 *   bulkActions={<MyBulkActions table={table} />}
 * />
 * ```
 *
 * For complex layouts (custom mobile, expanded rows, custom toolbar), use the
 * `toolbar` / `mobile` / `renderRow` slots instead of the `*Props` variants.
 */
export function DataTablePage<TData>(props: DataTablePageProps<TData>) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const showMobile = isMobile && !props.hideMobile

  const toolbarNode = renderToolbar(props)
  const mobileNode = renderMobile(props, showMobile)
  const desktopNode = renderDesktop(props, showMobile)

  return (
    <>
      <div
        className={cn(
          props.tableViewportScroll
            ? 'flex min-h-0 flex-1 flex-col gap-2.5 sm:gap-3'
            : 'space-y-2.5 sm:space-y-3',
          props.className
        )}
      >
        {toolbarNode ? (
          <div className={props.tableViewportScroll ? 'shrink-0' : undefined}>
            {toolbarNode}
          </div>
        ) : null}
        {mobileNode}
        {desktopNode}
        {props.afterTable}
      </div>

      {/* Bulk actions are typically a fixed-position toolbar; let the consumer
          handle its own visibility, we just gate it to non-mobile. */}
      {!showMobile && props.bulkActions}

      {props.showPagination !== false &&
        (props.paginationInFooter !== false ? (
          <PageFooterPortal>
            <DataTablePagination table={props.table} />
          </PageFooterPortal>
        ) : (
          <div className='pt-2'>
            <DataTablePagination table={props.table} />
          </div>
        ))}
    </>
  )
}

function renderToolbar<TData>(
  props: DataTablePageProps<TData>
): React.ReactNode {
  if (props.toolbar !== undefined) {
    return props.toolbar
  }
  if (props.toolbarProps === null) {
    return null
  }
  if (props.toolbarProps) {
    return <DataTableToolbar table={props.table} {...props.toolbarProps} />
  }
  return null
}

function renderMobile<TData>(
  props: DataTablePageProps<TData>,
  showMobile: boolean
): React.ReactNode {
  if (!showMobile) return null
  if (props.mobile !== undefined) return props.mobile

  const ownGetRowClassName = props.getRowClassName
  const mobileGetRowClassName =
    props.mobileProps?.getRowClassName ??
    (ownGetRowClassName
      ? (row: Row<TData>) => ownGetRowClassName(row, { isMobile: true })
      : undefined)

  return (
    <MobileCardList
      table={props.table}
      isLoading={props.isLoading}
      emptyTitle={props.emptyTitle}
      emptyDescription={props.emptyDescription}
      getRowKey={props.mobileProps?.getRowKey}
      getRowClassName={mobileGetRowClassName}
    />
  )
}

function renderDesktop<TData>(
  props: DataTablePageProps<TData>,
  showMobile: boolean
): React.ReactNode {
  if (showMobile) return null

  if (props.tableViewportScroll) {
    return <ViewportScrollDesktopTable {...props} />
  }

  const rows = props.table.getRowModel().rows
  const isFetchingOnly = props.isFetching && !props.isLoading

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border transition-opacity duration-150',
        isFetchingOnly && 'pointer-events-none opacity-60',
        props.tableClassName
      )}
    >
      <Table>
        <TableHeader className={props.tableHeaderClassName}>
          {props.table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  style={
                    props.applyHeaderSize
                      ? { width: header.getSize() }
                      : undefined
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {renderTableBody(props, rows)}
        </TableBody>
      </Table>
    </div>
  )
}

function renderTableBody<TData>(
  props: DataTablePageProps<TData>,
  rows: Row<TData>[]
) {
  if (props.isLoading) {
    return (
      <TableSkeleton table={props.table} keyPrefix={props.skeletonKeyPrefix} />
    )
  }

  if (rows.length === 0) {
    return (
      <TableEmpty
        colSpan={props.columns.length}
        title={props.emptyTitle}
        description={props.emptyDescription}
        icon={props.emptyIcon}
      >
        {props.emptyAction}
      </TableEmpty>
    )
  }

  return rows.map((row) => {
    if (props.renderRow) {
      return props.renderRow(row)
    }
    return (
      <DefaultRow
        key={row.id}
        row={row}
        className={props.getRowClassName?.(row, { isMobile: false })}
      />
    )
  })
}

function ViewportScrollDesktopTable<TData>(
  props: DataTablePageProps<TData>
) {
  const rows = props.table.getRowModel().rows
  const isFetchingOnly = props.isFetching && !props.isLoading
  const bodyRef = useRef<HTMLDivElement>(null)
  const xScrollRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [tableWidth, setTableWidth] = useState(0)
  const isSyncingRef = useRef(false)

  const updateTableWidth = useCallback(() => {
    const tableEl = measureRef.current?.querySelector('[data-slot="table"]')
    if (!tableEl) return
    setTableWidth(tableEl.scrollWidth)
  }, [])

  useEffect(() => {
    updateTableWidth()
    const target = measureRef.current
    if (!target) return

    const observer = new ResizeObserver(() => {
      updateTableWidth()
    })
    observer.observe(target)
    return () => observer.disconnect()
  }, [updateTableWidth, rows.length, props.columns.length, props.isLoading])

  const handleXScroll = useCallback(() => {
    if (isSyncingRef.current || !xScrollRef.current) return
    isSyncingRef.current = true
    setScrollLeft(xScrollRef.current.scrollLeft)
    requestAnimationFrame(() => {
      isSyncingRef.current = false
    })
  }, [])

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border transition-opacity duration-150',
        isFetchingOnly && 'pointer-events-none opacity-60',
        props.tableClassName
      )}
    >
      <div
        ref={bodyRef}
        className='min-h-0 flex-1 overflow-x-hidden overflow-y-auto'
      >
        <div
          ref={measureRef}
          style={{
            width: tableWidth > 0 ? tableWidth : '100%',
            transform: `translateX(-${scrollLeft}px)`,
          }}
        >
          <Table disableContainerScroll className='w-max min-w-full'>
            <TableHeader
              className={cn(
                'bg-muted/30 sticky top-0 z-10',
                props.tableHeaderClassName
              )}
            >
              {props.table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={
                        props.applyHeaderSize
                          ? { width: header.getSize() }
                          : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>{renderTableBody(props, rows)}</TableBody>
          </Table>
        </div>
      </div>

      <div
        ref={xScrollRef}
        className='bg-background shrink-0 overflow-x-auto overflow-y-hidden border-t'
        onScroll={handleXScroll}
        aria-hidden={tableWidth <= 0}
      >
        <div
          className='h-3 sm:h-3.5'
          style={{ width: tableWidth > 0 ? tableWidth : '100%' }}
        />
      </div>
    </div>
  )
}

function DefaultRow<TData>({
  row,
  className,
}: {
  row: Row<TData>
  className?: string
}) {
  return (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      className={className}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}
