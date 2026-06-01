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
import { ImageIcon, Settings, Sparkles, ToggleLeft, Users, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type {
  ChatCompletionRequest,
  GroupOption,
  Message,
  ModelOption,
  ParameterEnabled,
  PlaygroundConfig,
  PlaygroundStoredConfig,
} from '../types'
import { PlaygroundConfigManager } from './playground-config-manager'
import { PlaygroundCustomRequestEditor } from './playground-custom-request-editor'
import { PlaygroundParameterControl } from './playground-parameter-control'

type PlaygroundSettingsPanelProps = {
  config: PlaygroundConfig
  parameterEnabled: ParameterEnabled
  models: ModelOption[]
  groups: GroupOption[]
  messages: Message[]
  customRequestMode: boolean
  customRequestBody: string
  previewPayload: ChatCompletionRequest | null
  showDebugPanel?: boolean
  onConfigChange: <K extends keyof PlaygroundConfig>(
    key: K,
    value: PlaygroundConfig[K]
  ) => void
  onParameterToggle: (key: keyof ParameterEnabled) => void
  onCustomRequestModeChange: (value: boolean) => void
  onCustomRequestBodyChange: (value: string) => void
  onConfigImport: (config: PlaygroundStoredConfig) => void
  onConfigReset: () => void
  onClose?: () => void
  className?: string
}

export function PlaygroundSettingsPanel({
  config,
  parameterEnabled,
  models,
  groups,
  messages,
  customRequestMode,
  customRequestBody,
  previewPayload,
  showDebugPanel = true,
  onConfigChange,
  onParameterToggle,
  onCustomRequestModeChange,
  onCustomRequestBodyChange,
  onConfigImport,
  onConfigReset,
  onClose,
  className,
}: PlaygroundSettingsPanelProps) {
  const { t } = useTranslation()

  const currentConfig: PlaygroundStoredConfig = {
    inputs: config,
    parameterEnabled,
    showDebugPanel,
    customRequestMode,
    customRequestBody,
  }

  const disabledByCustomMode = customRequestMode

  return (
    <div
      className={cn(
        'bg-card flex h-full flex-col overflow-hidden border-r',
        className
      )}
    >
      <div className='flex items-center justify-between border-b px-4 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500'>
            <Settings className='size-5 text-white' />
          </div>
          <h2 className='text-base font-semibold'>{t('Model configuration')}</h2>
        </div>
        {onClose ? (
          <Button type='button' variant='ghost' size='icon' onClick={onClose}>
            <X className='size-4' />
          </Button>
        ) : null}
      </div>

      <div className='min-h-0 flex-1 space-y-5 overflow-y-auto p-4'>
        <PlaygroundCustomRequestEditor
          customRequestMode={customRequestMode}
          customRequestBody={customRequestBody}
          defaultPayload={previewPayload}
          onCustomRequestModeChange={onCustomRequestModeChange}
          onCustomRequestBodyChange={onCustomRequestBodyChange}
        />

        <div className={cn(disabledByCustomMode && 'opacity-50')}>
          <div className='mb-2 flex items-center gap-2'>
            <Users className='text-muted-foreground size-4' />
            <Label>{t('Group')}</Label>
          </div>
          <Select
            value={config.group}
            disabled={disabledByCustomMode}
            onValueChange={(value) => onConfigChange('group', value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={t('Select group')} />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.value} value={group.value}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={cn(disabledByCustomMode && 'opacity-50')}>
          <div className='mb-2 flex items-center gap-2'>
            <Sparkles className='text-muted-foreground size-4' />
            <Label>{t('Model')}</Label>
          </div>
          <Select
            value={config.model}
            disabled={disabledByCustomMode}
            onValueChange={(value) => onConfigChange('model', value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={t('Select model')} />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={cn('space-y-2', disabledByCustomMode && 'opacity-50')}>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <ImageIcon className='text-muted-foreground size-4' />
              <Label>{t('Image URL')}</Label>
            </div>
            <Switch
              checked={config.imageEnabled}
              disabled={disabledByCustomMode}
              onCheckedChange={(checked) => onConfigChange('imageEnabled', checked)}
            />
          </div>
          {config.imageUrls.map((url, index) => (
            <Input
              key={`image-url-${index}`}
              value={url}
              disabled={disabledByCustomMode || !config.imageEnabled}
              placeholder={t('Image URL')}
              onChange={(event) => {
                const next = [...config.imageUrls]
                next[index] = event.target.value
                onConfigChange('imageUrls', next)
              }}
            />
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={disabledByCustomMode || !config.imageEnabled}
            onClick={() => onConfigChange('imageUrls', [...config.imageUrls, ''])}
          >
            {t('Add image URL')}
          </Button>
        </div>

        <div className={cn(disabledByCustomMode && 'opacity-50')}>
          <PlaygroundParameterControl
            config={config}
            parameterEnabled={parameterEnabled}
            disabled={disabledByCustomMode}
            onConfigChange={onConfigChange}
            onParameterToggle={onParameterToggle}
          />
        </div>

        <div
          className={cn(
            'flex items-center justify-between',
            disabledByCustomMode && 'opacity-50'
          )}
        >
          <div className='flex items-center gap-2'>
            <ToggleLeft className='text-muted-foreground size-4' />
            <Label>{t('Stream output')}</Label>
          </div>
          <Switch
            checked={config.stream}
            disabled={disabledByCustomMode}
            onCheckedChange={(checked) => onConfigChange('stream', checked)}
          />
        </div>
      </div>

      <div className='border-t p-4'>
        <PlaygroundConfigManager
          currentConfig={currentConfig}
          messages={messages}
          onConfigImport={onConfigImport}
          onConfigReset={onConfigReset}
        />
      </div>
    </div>
  )
}
