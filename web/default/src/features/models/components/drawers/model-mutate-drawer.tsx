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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { JsonEditor } from '@/components/json-editor'
import { StatusBadge } from '@/components/status-badge'
import { TagInput } from '@/components/tag-input'
import { createModel, getModel, getPrefillGroups, getVendors, updateModel } from '../../api'
import { ENDPOINT_TEMPLATES, getNameRuleOptions } from '../../constants'
import {
  modelFormSchema,
  transformFormDataToModelPayload,
  transformModelToFormDefaults,
  type ModelFormValues,
} from '../../lib/model-form'
import { mergeEndpointPrefill, mergeTagPrefill } from '../../lib/prefill-merge'
import { modelsQueryKeys, vendorsQueryKeys } from '../../lib'
import type { Model, PrefillGroup } from '../../types'

type ModelMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Model | null
}

function normalizeTagsInput(tags: string[]): string[] {
  return [
    ...new Set(
      tags.flatMap((tag) =>
        tag
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
      )
    ),
  ]
}

export function ModelMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: ModelMutateDrawerProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isEditing = Boolean(currentRow?.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: vendorsData } = useQuery({
    queryKey: vendorsQueryKeys.list(),
    queryFn: () => getVendors({ page_size: 1000 }),
    enabled: open,
  })

  const { data: modelData, isLoading: isModelLoading } = useQuery({
    queryKey: modelsQueryKeys.detail(currentRow?.id || 0),
    queryFn: () => getModel(currentRow!.id),
    enabled: open && isEditing,
  })

  const { data: tagGroupsData } = useQuery({
    queryKey: ['prefill-groups', 'tag'],
    queryFn: () => getPrefillGroups('tag'),
    enabled: open,
  })

  const { data: endpointGroupsData } = useQuery({
    queryKey: ['prefill-groups', 'endpoint'],
    queryFn: () => getPrefillGroups('endpoint'),
    enabled: open,
  })

  const vendors = vendorsData?.data?.items || []
  const tagGroups = tagGroupsData?.data || []
  const endpointGroups = endpointGroupsData?.data || []
  const nameRuleOptions = getNameRuleOptions(t)

  const form = useForm<ModelFormValues>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      model_name: '',
      description: '',
      icon: '',
      tags: [],
      vendor_id: undefined,
      endpoints: '',
      name_rule: 0,
      status: true,
      sync_official: true,
      enable_groups: [],
      quota_types: [],
    },
  })

  const resetCreateForm = useCallback(() => {
    const prefilledName = currentRow?.model_name?.trim() || ''
    form.reset({
      model_name: prefilledName,
      description: '',
      icon: '',
      tags: [],
      vendor_id: undefined,
      endpoints: '',
      name_rule: prefilledName ? 0 : 0,
      status: true,
      sync_official: true,
      enable_groups: [],
      quota_types: [],
    })
  }, [currentRow?.model_name, form])

  useEffect(() => {
    if (!open) return
    if (isEditing && modelData?.data) {
      form.reset(transformModelToFormDefaults(modelData.data))
      return
    }
    if (!isEditing) {
      resetCreateForm()
    }
  }, [open, isEditing, modelData, form, resetCreateForm])

  const endpointTemplate = useMemo(
    () => ENDPOINT_TEMPLATES as Record<string, unknown>,
    []
  )

  const applyTagGroup = (group: PrefillGroup) => {
    const current = form.getValues('tags') || []
    form.setValue('tags', mergeTagPrefill(current, group.items), {
      shouldDirty: true,
    })
  }

  const applyEndpointGroup = (group: PrefillGroup) => {
    const current = form.getValues('endpoints') || ''
    form.setValue('endpoints', mergeEndpointPrefill(current, group.items), {
      shouldDirty: true,
    })
  }

  const onSubmit = async (values: ModelFormValues) => {
    setIsSubmitting(true)
    try {
      const payload = transformFormDataToModelPayload({
        ...values,
        tags: normalizeTagsInput(values.tags),
      })
      const response = isEditing
        ? await updateModel({ ...payload, id: currentRow!.id })
        : await createModel(payload)

      if (response.success) {
        toast.success(
          isEditing ? t('Model updated successfully') : t('Model created successfully')
        )
        queryClient.invalidateQueries({ queryKey: modelsQueryKeys.lists() })
        if (isEditing) {
          queryClient.invalidateQueries({
            queryKey: modelsQueryKeys.detail(currentRow!.id),
          })
        }
        onOpenChange(false)
      } else {
        toast.error(response.message || t('Operation failed'))
      }
    } catch (error: unknown) {
      toast.error((error as Error)?.message || t('Operation failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex h-dvh w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl'>
        <SheetHeader className='border-b px-4 py-3 text-start sm:px-6 sm:py-4'>
          <div className='flex items-center gap-2'>
            <StatusBadge
              label={isEditing ? t('Update') : t('New')}
              variant={isEditing ? 'info' : 'success'}
              copyable={false}
            />
            <SheetTitle className='text-base'>
              {isEditing ? t('Update model metadata') : t('Create new model')}
            </SheetTitle>
          </div>
          <SheetDescription>
            {t('Set basic model metadata for the model plaza display')}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='model-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-6'
          >
            {isEditing && isModelLoading ? (
              <div className='text-muted-foreground flex items-center justify-center py-12 text-sm'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('Loading...')}
              </div>
            ) : (
              <div className='space-y-4 rounded-xl border p-4'>
                <div>
                  <h3 className='text-sm font-semibold'>{t('Basic Information')}</h3>
                  <p className='text-muted-foreground text-xs'>
                    {t('Set the basic information for this model')}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name='model_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Model Name')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('Enter model name, e.g. gpt-4')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='name_rule'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Name matching type')}</FormLabel>
                      <Select
                        items={nameRuleOptions.map((option) => ({
                          value: String(option.value),
                          label: option.label,
                        }))}
                        value={String(field.value)}
                        onValueChange={(value) => {
                          if (value !== null) {
                            field.onChange(parseInt(value, 10))
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t('Select name matching type')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {nameRuleOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t(
                          'Find model metadata by model name and this rule. Priority: exact > prefix > suffix > contains'
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='icon'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Model icon')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('Enter icon name')} {...field} />
                      </FormControl>
                      <FormDescription className='text-xs'>
                        {t(
                          'Icons use the @lobehub/icons library, e.g. OpenAI, Claude.Color. See the icon library for all available icons.'
                        )}{' '}
                        <a
                          href='https://icons.lobehub.com/components/lobe-hub'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary inline-flex items-center gap-0.5 underline'
                        >
                          {t('Open icon library')}
                          <ExternalLink className='size-3' />
                        </a>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('Enter model description')}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='tags'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Tags')}</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value || []}
                          onChange={(tags) =>
                            field.onChange(normalizeTagsInput(tags))
                          }
                          placeholder={t(
                            'Enter tags or use comma to separate multiple tags'
                          )}
                        />
                      </FormControl>
                      {tagGroups.length > 0 && (
                        <div className='flex flex-wrap gap-2 pt-1'>
                          {tagGroups.map((group) => (
                            <Button
                              key={group.id}
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => applyTagGroup(group)}
                            >
                              {group.name}
                            </Button>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='vendor_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Vendor')}</FormLabel>
                      <Select
                        items={vendors.map((vendor) => ({
                          value: String(vendor.id),
                          label: vendor.name,
                        }))}
                        value={field.value ? String(field.value) : undefined}
                        onValueChange={(value) =>
                          field.onChange(value ? parseInt(value, 10) : undefined)
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('Select model vendor')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {vendors.map((vendor) => (
                              <SelectItem
                                key={vendor.id}
                                value={String(vendor.id)}
                              >
                                {vendor.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert variant='default'>
                  <AlertDescription>
                    {t(
                      'Tip: Settings here only control how this model appears in the Model Plaza and do not affect actual API routing. Configure real upstream behavior in Channel Management.'
                    )}
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name='endpoints'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('Endpoints shown in Model Plaza')}
                      </FormLabel>
                      <FormControl>
                        <JsonEditor
                          value={field.value || ''}
                          onChange={field.onChange}
                          template={endpointTemplate}
                          keyPlaceholder='openai'
                          valuePlaceholder='{"path": "/v1/chat/completions", "method": "POST"}'
                          keyLabel={t('Endpoint type')}
                          valueLabel={t('Configuration')}
                          valueType='any'
                          emptyMessage={t(
                            'No data. Switch to JSON mode or add a key-value pair.'
                          )}
                        />
                      </FormControl>
                      {endpointGroups.length > 0 && (
                        <div className='flex flex-wrap gap-2 pt-1'>
                          {endpointGroups.map((group) => (
                            <Button
                              key={group.id}
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => applyEndpointGroup(group)}
                            >
                              {group.name}
                            </Button>
                          ))}
                        </div>
                      )}
                      <FormDescription>
                        {t('Leave empty to use default endpoints; supports {path, method}')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='sync_official'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          {t('Participate in official sync')}
                        </FormLabel>
                        <FormDescription>
                          {t(
                            'When disabled, this model will not be overwritten or created by official sync'
                          )}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>{t('Status')}</FormLabel>
                        <FormDescription>
                          {t('Enable or disable this model')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </form>
        </Form>

        <SheetFooter className='grid grid-cols-2 gap-2 border-t px-4 py-3 sm:flex sm:px-6 sm:py-4'>
          <SheetClose
            render={<Button variant='outline' disabled={isSubmitting} />}
          >
            {t('Cancel')}
          </SheetClose>
          <Button form='model-form' type='submit' disabled={isSubmitting || isModelLoading}>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('Submit')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
