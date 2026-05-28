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
import { useState, useMemo, useEffect, useCallback, memo } from 'react'
import { type Control, useWatch } from 'react-hook-form'
import { Pencil, Plus, Trash2, GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { GroupGroupRatioRulesEditor } from './group-group-ratio-editor'
import { GroupNameCombobox } from './group-name-combobox'
import { parseGroupNamesFromGroupSettings } from './group-ratio-utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { safeJsonParse } from '../utils/json-parser'

type GroupFormValues = {
  GroupRatio: string
  TopupGroupRatio: string
  UserUsableGroups: string
  GroupGroupRatio: string
  AutoGroups: string
  DefaultUseAutoGroup: boolean
}

type GroupRatioVisualEditorProps = {
  control: Control<GroupFormValues>
  getFieldValue: (name: keyof GroupFormValues) => string
  onChange: (field: string, value: string) => void
  onDefaultUseAutoGroupChange: (value: boolean) => void
}

type SimpleGroup = {
  name: string
  value: string
}

type GroupPricingRow = {
  _id: string
  name: string
  ratio: number
  selectable: boolean
  description: string
}

type AutoGroupItem = {
  _id: string
  name: string
}

let autoGroupIdCounter = 0
function createAutoGroupId() {
  autoGroupIdCounter += 1
  return `ag_${autoGroupIdCounter}`
}

function parseAutoGroupItems(autoGroups: string): AutoGroupItem[] {
  const names = safeJsonParse<string[]>(autoGroups, {
    fallback: [],
    silent: true,
  })
  return names.map((name) => ({
    _id: createAutoGroupId(),
    name: String(name),
  }))
}

function serializeAutoGroupItems(items: AutoGroupItem[]): string {
  const names = items.map((item) => item.name.trim()).filter(Boolean)
  return JSON.stringify(names, null, 2)
}

function autoGroupItemsSignature(items: AutoGroupItem[]): string {
  return JSON.stringify(items.map((item) => item.name.trim()).filter(Boolean))
}

function sourceAutoGroupsSignature(autoGroups: string): string {
  return JSON.stringify(
    safeJsonParse<string[]>(autoGroups, { fallback: [], silent: true })
      .map((name) => String(name).trim())
      .filter(Boolean)
  )
}

const sectionCardClassName =
  'relative shadow-sm ring-0 before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:border before:border-border/90'
const sectionHeaderClassName = 'border-b bg-muted/20'

let groupPricingIdCounter = 0
function createGroupPricingId() {
  groupPricingIdCounter += 1
  return `gpr_${groupPricingIdCounter}`
}

function normalizeRatio(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 1
}

function buildGroupPricingRows(
  groupRatio: string,
  userUsableGroups: string
): GroupPricingRow[] {
  const ratioMap = safeJsonParse<Record<string, number>>(groupRatio, {
    fallback: {},
    context: 'group ratios',
  })
  const usableMap = safeJsonParse<Record<string, string>>(userUsableGroups, {
    fallback: {},
    context: 'user usable groups',
  })
  const names = new Set([...Object.keys(ratioMap), ...Object.keys(usableMap)])

  return Array.from(names).map((name) => ({
    _id: createGroupPricingId(),
    name,
    ratio: normalizeRatio(ratioMap[name]),
    selectable: Object.prototype.hasOwnProperty.call(usableMap, name),
    description: String(usableMap[name] ?? ''),
  }))
}

function serializeGroupPricingRows(rows: GroupPricingRow[]) {
  const groupRatio: Record<string, number> = {}
  const userUsableGroups: Record<string, string> = {}

  for (const row of rows) {
    const name = row.name.trim()
    if (!name) continue
    groupRatio[name] = normalizeRatio(row.ratio)
    if (row.selectable) {
      userUsableGroups[name] = row.description
    }
  }

  return {
    GroupRatio: JSON.stringify(groupRatio, null, 2),
    UserUsableGroups: JSON.stringify(userUsableGroups, null, 2),
  }
}

function groupPricingSignature(rows: GroupPricingRow[]): string {
  const serialized = serializeGroupPricingRows(rows)
  return JSON.stringify({
    groupRatio: safeJsonParse(serialized.GroupRatio, {
      fallback: {},
      silent: true,
    }),
    userUsableGroups: safeJsonParse(serialized.UserUsableGroups, {
      fallback: {},
      silent: true,
    }),
  })
}

function sourceGroupPricingSignature(
  groupRatio: string,
  userUsableGroups: string
): string {
  return JSON.stringify({
    groupRatio: safeJsonParse(groupRatio, { fallback: {}, silent: true }),
    userUsableGroups: safeJsonParse(userUsableGroups, {
      fallback: {},
      silent: true,
    }),
  })
}

export const GroupRatioVisualEditor = memo(function GroupRatioVisualEditor({
  control,
  getFieldValue,
  onChange,
  onDefaultUseAutoGroupChange,
}: GroupRatioVisualEditorProps) {
  const { t } = useTranslation()
  const groupRatio = useWatch({ control, name: 'GroupRatio' }) ?? ''
  const userUsableGroups =
    useWatch({ control, name: 'UserUsableGroups' }) ?? ''
  const topupGroupRatio = useWatch({ control, name: 'TopupGroupRatio' }) ?? ''
  const autoGroups = useWatch({ control, name: 'AutoGroups' }) ?? ''
  const groupGroupRatio = useWatch({ control, name: 'GroupGroupRatio' }) ?? ''
  const defaultUseAutoGroup =
    useWatch({ control, name: 'DefaultUseAutoGroup' }) ?? false
  const [liveGroupNames, setLiveGroupNames] = useState<string[]>([])
  const groupNames = useMemo(() => {
    const fromFields = parseGroupNamesFromGroupSettings(
      groupRatio,
      userUsableGroups
    )
    const merged = new Set([...fromFields, ...liveGroupNames])
    return Array.from(merged)
      .filter((name) => name.trim().length > 0)
      .sort((a, b) => a.localeCompare(b))
  }, [groupRatio, userUsableGroups, liveGroupNames])
  const [simpleDialogOpen, setSimpleDialogOpen] = useState(false)
  const [simpleDialogType, setSimpleDialogType] = useState<
    'groupRatio' | 'topupGroupRatio' | null
  >(null)
  const [simpleEditData, setSimpleEditData] = useState<SimpleGroup | null>(null)

  // Parse topup group ratios
  const topupRatioList = useMemo(() => {
    const map = safeJsonParse<Record<string, number>>(topupGroupRatio, {
      fallback: {},
      context: 'topup group ratios',
    })
    return Object.entries(map).map(([name, value]) => ({
      name,
      value: String(value),
    }))
  }, [topupGroupRatio])

  const handleSimpleAdd = (type: 'groupRatio' | 'topupGroupRatio') => {
    setSimpleDialogType(type)
    setSimpleEditData(null)
    setSimpleDialogOpen(true)
  }

  const handleSimpleEdit = (
    type: 'groupRatio' | 'topupGroupRatio',
    group: SimpleGroup
  ) => {
    setSimpleDialogType(type)
    setSimpleEditData(group)
    setSimpleDialogOpen(true)
  }

  const handleSimpleSave = (name: string, value: string) => {
    if (!simpleDialogType) return

    const fieldName =
      simpleDialogType === 'groupRatio'
        ? getFieldValue('GroupRatio')
        : topupGroupRatio
    const map = safeJsonParse<Record<string, number>>(fieldName, {
      fallback: {},
      silent: true,
    })

    if (simpleEditData && simpleEditData.name !== name) {
      delete map[simpleEditData.name]
    }

    map[name] = parseFloat(value)

    const field =
      simpleDialogType === 'groupRatio' ? 'GroupRatio' : 'TopupGroupRatio'
    onChange(field, JSON.stringify(map, null, 2))
    setSimpleDialogOpen(false)
  }

  const handleSimpleDelete = (
    type: 'groupRatio' | 'topupGroupRatio',
    name: string
  ) => {
    const fieldName =
      type === 'groupRatio' ? getFieldValue('GroupRatio') : topupGroupRatio
    const map = safeJsonParse<Record<string, number>>(fieldName, {
      fallback: {},
      silent: true,
    })
    delete map[name]

    const field = type === 'groupRatio' ? 'GroupRatio' : 'TopupGroupRatio'
    onChange(field, JSON.stringify(map, null, 2))
  }

  return (
    <div className='space-y-4'>
      <GroupPricingTable
        control={control}
        onChange={onChange}
        onGroupNamesChange={setLiveGroupNames}
      />

      <AutoGroupListSection
        autoGroups={autoGroups}
        groupNames={groupNames}
        defaultUseAutoGroup={defaultUseAutoGroup}
        onDefaultUseAutoGroupChange={onDefaultUseAutoGroupChange}
        onChange={(value) => onChange('AutoGroups', value)}
      />

      <GroupGroupRatioRulesEditor
        value={groupGroupRatio}
        groupNames={groupNames}
        onChange={(value) => onChange('GroupGroupRatio', value)}
      />

      {/* Topup Group Ratios */}
      <Card className={sectionCardClassName}>
        <CardHeader className={sectionHeaderClassName}>
          <CardTitle>{t('Top-up group ratios')}</CardTitle>
          <CardDescription>
            {t('Multipliers for recharge pricing based on user groups.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Button
              onClick={() => handleSimpleAdd('topupGroupRatio')}
              size='sm'
            >
              <Plus className='mr-2 h-4 w-4' />
              {t('Add group')}
            </Button>
            {topupRatioList.length > 0 && (
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Group name')}</TableHead>
                      <TableHead>{t('Multiplier')}</TableHead>
                      <TableHead className='text-right'>
                        {t('Actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topupRatioList.map((group) => (
                      <TableRow key={group.name}>
                        <TableCell className='font-medium'>
                          {group.name}
                        </TableCell>
                        <TableCell>{group.value}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleSimpleEdit('topupGroupRatio', group)
                              }
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleSimpleDelete(
                                  'topupGroupRatio',
                                  group.name
                                )
                              }
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SimpleGroupDialog
        open={simpleDialogOpen}
        onOpenChange={setSimpleDialogOpen}
        onSave={handleSimpleSave}
        editData={simpleEditData}
        type={simpleDialogType}
        groupNames={groupNames}
      />
    </div>
  )
})

type GroupPricingTableProps = {
  control: Control<GroupFormValues>
  onChange: (field: string, value: string) => void
  onGroupNamesChange?: (names: string[]) => void
}

function GroupPricingTable({
  control,
  onChange,
  onGroupNamesChange,
}: GroupPricingTableProps) {
  const { t } = useTranslation()
  const groupRatio = useWatch({ control, name: 'GroupRatio' }) ?? ''
  const userUsableGroups = useWatch({ control, name: 'UserUsableGroups' }) ?? ''
  const [rows, setRows] = useState<GroupPricingRow[]>(() =>
    buildGroupPricingRows(groupRatio, userUsableGroups)
  )

  useEffect(() => {
    const incomingSignature = sourceGroupPricingSignature(
      groupRatio,
      userUsableGroups
    )
    setRows((currentRows) => {
      if (groupPricingSignature(currentRows) === incomingSignature) {
        return currentRows
      }
      return buildGroupPricingRows(groupRatio, userUsableGroups)
    })
  }, [groupRatio, userUsableGroups])

  const emitRows = useCallback(
    (nextRows: GroupPricingRow[]) => {
      setRows(nextRows)
      onGroupNamesChange?.(
        nextRows.map((row) => row.name.trim()).filter(Boolean)
      )
      const serialized = serializeGroupPricingRows(nextRows)
      onChange('GroupRatio', serialized.GroupRatio)
      onChange('UserUsableGroups', serialized.UserUsableGroups)
    },
    [onChange, onGroupNamesChange]
  )

  useEffect(() => {
    onGroupNamesChange?.(rows.map((row) => row.name.trim()).filter(Boolean))
  }, [onGroupNamesChange, rows])

  const updateRow = useCallback(
    (
      id: string,
      field: Exclude<keyof GroupPricingRow, '_id'>,
      value: string | number | boolean
    ) => {
      emitRows(
        rows.map((row) => (row._id === id ? { ...row, [field]: value } : row))
      )
    },
    [emitRows, rows]
  )

  const addRow = useCallback(() => {
    const existingNames = new Set(rows.map((row) => row.name))
    let index = 1
    let name = `group_${index}`
    while (existingNames.has(name)) {
      index += 1
      name = `group_${index}`
    }
    emitRows([
      ...rows,
      {
        _id: createGroupPricingId(),
        name,
        ratio: 1,
        selectable: true,
        description: '',
      },
    ])
  }, [emitRows, rows])

  const removeRow = useCallback(
    (id: string) => {
      emitRows(rows.filter((row) => row._id !== id))
    },
    [emitRows, rows]
  )

  const duplicateNames = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of rows) {
      const name = row.name.trim()
      if (!name) continue
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([name]) => name)
  }, [rows])

  return (
    <Card className={sectionCardClassName}>
      <CardHeader className={sectionHeaderClassName}>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <CardTitle>{t('Group management')}</CardTitle>
            <CardDescription>
              {t(
                'Ratios are billing multipliers. Check "User selectable" to let users pick the group when creating tokens.'
              )}
            </CardDescription>
          </div>
          <Button onClick={addRow} size='sm' className='sm:self-start'>
            <Plus className='mr-2 h-4 w-4' />
            {t('Add group')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          <div className='overflow-x-auto rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='min-w-40'>{t('Group name')}</TableHead>
                  <TableHead className='w-28'>{t('Ratio')}</TableHead>
                  <TableHead className='w-28 text-center'>
                    {t('User selectable')}
                  </TableHead>
                  <TableHead className='min-w-56'>{t('Description')}</TableHead>
                  <TableHead className='w-16 text-right'>
                    {t('Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='text-muted-foreground h-20 text-center text-sm'
                    >
                      {t('No groups yet. Add a group to get started.')}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell>
                        <Input
                          value={row.name}
                          onChange={(event) =>
                            updateRow(row._id, 'name', event.target.value)
                          }
                          aria-invalid={duplicateNames.includes(
                            row.name.trim()
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type='number'
                          min={0}
                          step={0.1}
                          value={String(row.ratio)}
                          onChange={(event) =>
                            updateRow(
                              row._id,
                              'ratio',
                              normalizeRatio(event.target.value)
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className='flex justify-center'>
                          <Checkbox
                            checked={row.selectable}
                            onCheckedChange={(checked) =>
                              updateRow(row._id, 'selectable', checked === true)
                            }
                            aria-label={t('User selectable')}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.selectable ? (
                          <Input
                            value={row.description}
                            placeholder={t('Group description')}
                            onChange={(event) =>
                              updateRow(
                                row._id,
                                'description',
                                event.target.value
                              )
                            }
                          />
                        ) : (
                          <span className='text-muted-foreground px-3 text-sm'>
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => removeRow(row._id)}
                          aria-label={t('Delete')}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {duplicateNames.length > 0 && (
            <p className='text-destructive text-sm'>
              {t('Duplicate group names: {{names}}', {
                names: duplicateNames.join(', '),
              })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

type AutoGroupListSectionProps = {
  autoGroups: string
  groupNames: string[]
  defaultUseAutoGroup: boolean
  onDefaultUseAutoGroupChange: (value: boolean) => void
  onChange: (value: string) => void
}

function AutoGroupListSection({
  autoGroups,
  groupNames,
  defaultUseAutoGroup,
  onDefaultUseAutoGroupChange,
  onChange,
}: AutoGroupListSectionProps) {
  const { t } = useTranslation()
  const [items, setItems] = useState<AutoGroupItem[]>(() =>
    parseAutoGroupItems(autoGroups)
  )

  useEffect(() => {
    const incomingSignature = sourceAutoGroupsSignature(autoGroups)
    setItems((currentItems) => {
      if (autoGroupItemsSignature(currentItems) === incomingSignature) {
        return currentItems
      }
      return parseAutoGroupItems(autoGroups)
    })
  }, [autoGroups])

  const emitItems = useCallback(
    (nextItems: AutoGroupItem[]) => {
      setItems(nextItems)
      onChange(serializeAutoGroupItems(nextItems))
    },
    [onChange]
  )

  const addItem = useCallback(() => {
    emitItems([...items, { _id: createAutoGroupId(), name: '' }])
  }, [emitItems, items])

  const updateItem = useCallback(
    (id: string, name: string) => {
      emitItems(items.map((item) => (item._id === id ? { ...item, name } : item)))
    },
    [emitItems, items]
  )

  const removeItem = useCallback(
    (id: string) => {
      emitItems(items.filter((item) => item._id !== id))
    },
    [emitItems, items]
  )

  const moveItem = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const next = [...items]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= next.length) return
      ;[next[index], next[newIndex]] = [next[newIndex], next[index]]
      emitItems(next)
    },
    [emitItems, items]
  )

  return (
    <Card className={sectionCardClassName}>
      <CardHeader className={sectionHeaderClassName}>
        <CardTitle>{t('Auto grouping')}</CardTitle>
        <CardDescription>
          {t(
            'When the token group is set to auto, try available groups in the following order. Groups listed first have higher priority.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>{t('Default to auto groups')}</p>
              <p className='text-muted-foreground text-sm'>
                {t(
                  'When enabled, newly created tokens start with auto and initial tokens are also set to auto.'
                )}
              </p>
            </div>
            <Switch
              checked={defaultUseAutoGroup}
              onCheckedChange={onDefaultUseAutoGroupChange}
            />
          </div>

          {items.length === 0 ? (
            <p className='text-muted-foreground py-4 text-center text-sm'>
              {t('No auto groups yet. Add a group below.')}
            </p>
          ) : (
            <div className='space-y-2'>
              {items.map((item, index) => (
                <div
                  key={item._id}
                  className='flex items-center gap-2 rounded-md border p-3'
                >
                  <span className='text-muted-foreground w-6 shrink-0 text-center text-sm'>
                    {index + 1}
                  </span>
                  <GripVertical className='text-muted-foreground h-4 w-4 shrink-0' />
                  <GroupNameCombobox
                    groupNames={groupNames}
                    value={item.name}
                    onValueChange={(name) => updateItem(item._id, name)}
                    placeholder={t('Select group')}
                    className='min-w-0 flex-1'
                  />
                  <div className='flex shrink-0 gap-1'>
                    <Button
                      variant='ghost'
                      size='sm'
                      disabled={index === 0}
                      onClick={() => moveItem(index, 'up')}
                      aria-label={t('Move up')}
                    >
                      ↑
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(index, 'down')}
                      aria-label={t('Move down')}
                    >
                      ↓
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => removeItem(item._id)}
                      aria-label={t('Delete')}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button onClick={addItem} size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            {t('Add group')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Simple Group Dialog Component
type SimpleGroupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string, value: string) => void
  editData: SimpleGroup | null
  type: 'groupRatio' | 'topupGroupRatio' | null
  groupNames: string[]
}

function SimpleGroupDialog({
  open,
  onOpenChange,
  onSave,
  editData,
  type,
  groupNames,
}: SimpleGroupDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [value, setValue] = useState('')

  const title = type === 'groupRatio' ? t('group ratio') : t('top-up ratio')

  useEffect(() => {
    if (!open) {
      setName('')
      setValue('')
      return
    }

    setName(editData?.name ?? '')
    setValue(editData?.value ?? '')
  }, [editData, open])

  const handleSave = () => {
    if (!name.trim() || !value.trim()) return
    onSave(name.trim(), value.trim())
    setName('')
    setValue('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editData
              ? t('Edit {{title}}', { title })
              : t('Add {{title}}', { title })}
          </DialogTitle>
          <DialogDescription>
            {t('Configure the ratio for this group.')}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label>{t('Group name')}</Label>
            <GroupNameCombobox
              groupNames={groupNames}
              value={name}
              onValueChange={setName}
              placeholder={t('Select group')}
              disabled={!!editData}
            />
          </div>
          <div className='space-y-2'>
            <Label>{t('Ratio')}</Label>
            <Input
              value={value}
              onChange={(e) => {
                const val = e.target.value
                if (val === '' || !isNaN(parseFloat(val))) {
                  setValue(val)
                }
              }}
              placeholder='1.0'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('Cancel')}
          </Button>
          <Button onClick={handleSave}>
            {editData ? t('Update') : t('Add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
