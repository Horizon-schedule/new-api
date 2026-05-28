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
import { useCallback, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/status-badge'
import { GroupNameCombobox } from './group-name-combobox'
import { safeJsonParse } from '../utils/json-parser'

const sectionCardClassName =
  'relative shadow-sm ring-0 before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:border before:border-border/90'
const sectionHeaderClassName = 'border-b bg-muted/20'

type Rule = {
  _id: string
  userGroup: string
  usingGroup: string
  ratio: number
}

let idCounter = 0
function uid() {
  idCounter += 1
  return `ggr_${idCounter}`
}

function flattenRules(
  nested: Record<string, Record<string, number>>
): Rule[] {
  const rules: Rule[] = []
  for (const [userGroup, inner] of Object.entries(nested)) {
    if (typeof inner !== 'object' || inner === null) continue
    for (const [usingGroup, ratio] of Object.entries(inner)) {
      rules.push({
        _id: uid(),
        userGroup,
        usingGroup,
        ratio: typeof ratio === 'number' ? ratio : 1,
      })
    }
  }
  return rules
}

function nestRules(rules: Rule[]): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {}
  for (const { userGroup, usingGroup, ratio } of rules) {
    if (!userGroup || !usingGroup) continue
    if (!result[userGroup]) result[userGroup] = {}
    result[userGroup][usingGroup] = ratio
  }
  return result
}

function serializeRules(rules: Rule[]): string {
  const nested = nestRules(rules)
  return Object.keys(nested).length === 0
    ? ''
    : JSON.stringify(nested, null, 2)
}

type GroupSectionProps = {
  groupName: string
  groupNames: string[]
  items: Rule[]
  onUpdate: (id: string, field: keyof Rule, val: string | number) => void
  onRemove: (id: string) => void
  onAdd: (groupName: string) => void
  onRemoveGroup: (groupName: string) => void
}

function GroupSection({
  groupName,
  groupNames,
  items,
  onUpdate,
  onRemove,
  onAdd,
  onRemoveGroup,
}: GroupSectionProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className='rounded-lg border'>
        <div className='flex items-center justify-between p-3'>
          <div className='flex items-center gap-2'>
            <CollapsibleTrigger
              render={
                <Button variant='ghost' size='sm' className='h-6 w-6 p-0' />
              }
            >
              {open ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronDown className='h-4 w-4' />
              )}
            </CollapsibleTrigger>
            <span className='font-semibold'>{groupName}</span>
            <StatusBadge variant='neutral' copyable={false}>
              {items.length} {t('rules')}
            </StatusBadge>
          </div>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 w-7 p-0'
              onClick={() => onAdd(groupName)}
            >
              <Plus className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='text-destructive h-7 w-7 p-0'
              onClick={() => onRemoveGroup(groupName)}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <CollapsibleContent>
          <div className='space-y-2 border-t p-3'>
            {items.map((rule) => (
              <div key={rule._id} className='flex items-center gap-2'>
                <GroupNameCombobox
                  groupNames={groupNames}
                  value={rule.usingGroup}
                  onValueChange={(value) =>
                    onUpdate(rule._id, 'usingGroup', value)
                  }
                  placeholder={t('Select token group')}
                  className='min-w-0 flex-1'
                />
                <Input
                  type='number'
                  min={0}
                  step={0.1}
                  className='w-28'
                  value={String(rule.ratio)}
                  onChange={(event) =>
                    onUpdate(
                      rule._id,
                      'ratio',
                      Number.isFinite(Number(event.target.value))
                        ? Number(event.target.value)
                        : 1
                    )
                  }
                />
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-destructive h-8 w-8 p-0'
                  onClick={() => onRemove(rule._id)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

type GroupGroupRatioRulesEditorProps = {
  value: string
  onChange: (value: string) => void
  groupNames: string[]
}

export function GroupGroupRatioRulesEditor({
  value,
  onChange,
  groupNames,
}: GroupGroupRatioRulesEditorProps) {
  const { t } = useTranslation()
  const [rules, setRules] = useState<Rule[]>(() =>
    flattenRules(
      safeJsonParse<Record<string, Record<string, number>>>(value, {
        fallback: {},
        silent: true,
      })
    )
  )
  const [newGroupName, setNewGroupName] = useState('')

  const emitChange = useCallback(
    (nextRules: Rule[]) => {
      setRules(nextRules)
      onChange(serializeRules(nextRules))
    },
    [onChange]
  )

  const updateRule = useCallback(
    (id: string, field: keyof Rule, val: string | number) => {
      emitChange(
        rules.map((rule) =>
          rule._id === id ? { ...rule, [field]: val } : rule
        )
      )
    },
    [emitChange, rules]
  )

  const removeRule = useCallback(
    (id: string) => emitChange(rules.filter((rule) => rule._id !== id)),
    [emitChange, rules]
  )

  const removeGroup = useCallback(
    (groupName: string) =>
      emitChange(rules.filter((rule) => rule.userGroup !== groupName)),
    [emitChange, rules]
  )

  const addRuleToGroup = useCallback(
    (groupName: string) => {
      emitChange([
        ...rules,
        { _id: uid(), userGroup: groupName, usingGroup: '', ratio: 1 },
      ])
    },
    [emitChange, rules]
  )

  const addNewGroup = useCallback(() => {
    const name = newGroupName.trim()
    if (!name) return
    emitChange([
      ...rules,
      { _id: uid(), userGroup: name, usingGroup: '', ratio: 1 },
    ])
    setNewGroupName('')
  }, [emitChange, newGroupName, rules])

  const grouped = useMemo(() => {
    const map: Record<string, Rule[]> = {}
    const order: string[] = []
    for (const rule of rules) {
      if (!rule.userGroup) continue
      if (!map[rule.userGroup]) {
        map[rule.userGroup] = []
        order.push(rule.userGroup)
      }
      map[rule.userGroup].push(rule)
    }
    return order.map((name) => ({ name, items: map[name] }))
  }, [rules])

  return (
    <Card className={sectionCardClassName}>
      <CardHeader className={sectionHeaderClassName}>
        <CardTitle>{t('Special group ratio')}</CardTitle>
        <CardDescription>
          {t(
            'When users in one group use tokens from another group, set special ratio overrides. Example: vip users get 0.5x when using the default group.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {grouped.length === 0 ? (
            <p className='text-muted-foreground py-4 text-center text-sm'>
              {t('No rules yet. Add a group below to get started.')}
            </p>
          ) : (
            grouped.map((group) => (
              <GroupSection
                key={group.name}
                groupName={group.name}
                groupNames={groupNames}
                items={group.items}
                onUpdate={updateRule}
                onRemove={removeRule}
                onAdd={addRuleToGroup}
                onRemoveGroup={removeGroup}
              />
            ))
          )}

          <div className='flex flex-wrap items-center justify-center gap-2 pt-2'>
            <GroupNameCombobox
              groupNames={groupNames}
              value={newGroupName}
              onValueChange={setNewGroupName}
              placeholder={t('Select user group')}
              className='w-full max-w-xs'
            />
            <Button variant='outline' size='sm' onClick={addNewGroup}>
              <Plus className='mr-1 h-4 w-4' />
              {t('Add group rules')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
