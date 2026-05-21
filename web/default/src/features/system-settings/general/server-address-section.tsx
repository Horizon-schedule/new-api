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
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SettingsSection } from '../components/settings-section'
import { useResetForm } from '../hooks/use-reset-form'
import { useUpdateOption } from '../hooks/use-update-option'
import { removeTrailingSlash } from '../integrations/utils'

const schema = z.object({
  ServerAddress: z.string(),
})

type ServerAddressFormValues = z.infer<typeof schema>

type ServerAddressSectionProps = {
  defaultValue: string
}

export function ServerAddressSection({
  defaultValue,
}: ServerAddressSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const form = useForm<ServerAddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ServerAddress: defaultValue ?? '' },
  })

  useResetForm(form, { ServerAddress: defaultValue ?? '' })

  const onSubmit = async (values: ServerAddressFormValues) => {
    const sanitized = removeTrailingSlash(values.ServerAddress.trim())
    const initial = removeTrailingSlash((defaultValue ?? '').trim())
    if (sanitized === initial) return
    await updateOption.mutateAsync({ key: 'ServerAddress', value: sanitized })
  }

  return (
    <SettingsSection
      title={t('General Settings')}
      description={t('Configure the public server address used for OAuth callbacks')}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='ServerAddress'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Server address')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='https://your-domain.com'
                    autoComplete='off'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' disabled={updateOption.isPending}>
            {t('Save changes')}
          </Button>
        </form>
      </Form>
    </SettingsSection>
  )
}
