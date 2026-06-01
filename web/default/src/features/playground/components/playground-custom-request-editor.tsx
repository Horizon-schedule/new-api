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
import { useEffect, useState } from 'react'
import { AlertTriangle, Code } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { ChatCompletionRequest } from '../types'

type PlaygroundCustomRequestEditorProps = {
  customRequestMode: boolean
  customRequestBody: string
  defaultPayload: ChatCompletionRequest | null
  onCustomRequestModeChange: (value: boolean) => void
  onCustomRequestBodyChange: (value: string) => void
}

export function PlaygroundCustomRequestEditor({
  customRequestMode,
  customRequestBody,
  defaultPayload,
  onCustomRequestModeChange,
  onCustomRequestBodyChange,
}: PlaygroundCustomRequestEditorProps) {
  const { t } = useTranslation()
  const [localValue, setLocalValue] = useState(customRequestBody)
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    if (
      customRequestMode &&
      (!customRequestBody || customRequestBody.trim() === '') &&
      defaultPayload
    ) {
      const next = JSON.stringify(defaultPayload, null, 2)
      setLocalValue(next)
      onCustomRequestBodyChange(next)
    }
  }, [
    customRequestMode,
    customRequestBody,
    defaultPayload,
    onCustomRequestBodyChange,
  ])

  useEffect(() => {
    setLocalValue(customRequestBody)
  }, [customRequestBody])

  const validateJson = (value: string) => {
    if (!value.trim()) {
      setIsValid(true)
      return true
    }
    try {
      JSON.parse(value)
      setIsValid(true)
      return true
    } catch {
      setIsValid(false)
      return false
    }
  }

  return (
    <div className='space-y-3 rounded-lg border p-3'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Code className='text-muted-foreground size-4' />
          <Label className='text-sm font-medium'>
            {t('Custom request mode')}
          </Label>
        </div>
        <Switch
          checked={customRequestMode}
          onCheckedChange={onCustomRequestModeChange}
        />
      </div>
      <p className='text-muted-foreground text-xs'>
        {t(
          'When enabled, requests use your custom JSON body and model panel settings are ignored.'
        )}
      </p>
      {customRequestMode ? (
        <div className='space-y-2'>
          {!isValid ? (
            <Alert variant='destructive'>
              <AlertTriangle data-icon='inline-start' />
              <AlertDescription>
                {t('Invalid JSON in custom request body')}
              </AlertDescription>
            </Alert>
          ) : null}
          <Textarea
            rows={8}
            value={localValue}
            className='font-mono text-xs'
            onChange={(event) => {
              const next = event.target.value
              setLocalValue(next)
              if (validateJson(next)) {
                onCustomRequestBodyChange(next)
              }
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
