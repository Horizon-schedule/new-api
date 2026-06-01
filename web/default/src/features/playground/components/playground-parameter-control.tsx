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
import {
  Ban,
  Check,
  Hash,
  Repeat,
  Shuffle,
  Target,
  Thermometer,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { ParameterEnabled, PlaygroundConfig } from '../types'

type PlaygroundParameterControlProps = {
  config: PlaygroundConfig
  parameterEnabled: ParameterEnabled
  disabled?: boolean
  onConfigChange: <K extends keyof PlaygroundConfig>(
    key: K,
    value: PlaygroundConfig[K]
  ) => void
  onParameterToggle: (key: keyof ParameterEnabled) => void
}

type ParameterFieldProps = {
  label: string
  description: string
  icon: React.ReactNode
  valueLabel?: string
  enabled: boolean
  disabled?: boolean
  onToggle: () => void
  children: React.ReactNode
}

function ParameterField({
  label,
  description,
  icon,
  valueLabel,
  enabled,
  disabled,
  onToggle,
  children,
}: ParameterFieldProps) {
  return (
    <div
      className={cn(
        'space-y-2 transition-opacity',
        (!enabled || disabled) && 'opacity-50'
      )}
    >
      <div className='flex items-center justify-between gap-2'>
        <div className='flex min-w-0 items-center gap-2'>
          {icon}
          <Label className='text-sm font-medium'>{label}</Label>
          {valueLabel ? (
            <Badge variant='secondary' className='rounded-full px-2'>
              {valueLabel}
            </Badge>
          ) : null}
        </div>
        <Button
          type='button'
          variant={enabled ? 'default' : 'outline'}
          size='icon'
          className='size-6 shrink-0 rounded-full'
          disabled={disabled}
          onClick={onToggle}
        >
          {enabled ? <Check className='size-3' /> : <X className='size-3' />}
        </Button>
      </div>
      <p className='text-muted-foreground text-xs'>{description}</p>
      {children}
    </div>
  )
}

export function PlaygroundParameterControl({
  config,
  parameterEnabled,
  disabled = false,
  onConfigChange,
  onParameterToggle,
}: PlaygroundParameterControlProps) {
  const { t } = useTranslation()

  return (
    <div className='space-y-5'>
      <ParameterField
        label='Temperature'
        description={t('Controls randomness and creativity of outputs')}
        icon={<Thermometer className='text-muted-foreground size-4' />}
        valueLabel={String(config.temperature)}
        enabled={parameterEnabled.temperature}
        disabled={disabled}
        onToggle={() => onParameterToggle('temperature')}
      >
        <div className='space-y-2'>
          <Slider
            min={0.1}
            max={1}
            step={0.1}
            value={[config.temperature]}
            disabled={!parameterEnabled.temperature || disabled}
            onValueChange={([value]) => onConfigChange('temperature', value)}
          />
        </div>
      </ParameterField>

      <ParameterField
        label='Top P'
        description={t('Controls diversity via nucleus sampling')}
        icon={<Target className='text-muted-foreground size-4' />}
        valueLabel={String(config.top_p)}
        enabled={parameterEnabled.top_p}
        disabled={disabled}
        onToggle={() => onParameterToggle('top_p')}
      >
        <Slider
          min={0.1}
          max={1}
          step={0.1}
          value={[config.top_p]}
          disabled={!parameterEnabled.top_p || disabled}
          onValueChange={([value]) => onConfigChange('top_p', value)}
        />
      </ParameterField>

      <ParameterField
        label={t('Frequency penalty')}
        description={t('Reduces repetition of frequent tokens')}
        icon={<Repeat className='text-muted-foreground size-4' />}
        valueLabel={String(config.frequency_penalty)}
        enabled={parameterEnabled.frequency_penalty}
        disabled={disabled}
        onToggle={() => onParameterToggle('frequency_penalty')}
      >
        <Slider
          min={0}
          max={2}
          step={0.1}
          value={[config.frequency_penalty]}
          disabled={!parameterEnabled.frequency_penalty || disabled}
          onValueChange={([value]) =>
            onConfigChange('frequency_penalty', value)
          }
        />
      </ParameterField>

      <ParameterField
        label={t('Presence penalty')}
        description={t('Encourages the model to talk about new topics')}
        icon={<Ban className='text-muted-foreground size-4' />}
        valueLabel={String(config.presence_penalty)}
        enabled={parameterEnabled.presence_penalty}
        disabled={disabled}
        onToggle={() => onParameterToggle('presence_penalty')}
      >
        <Slider
          min={0}
          max={2}
          step={0.1}
          value={[config.presence_penalty]}
          disabled={!parameterEnabled.presence_penalty || disabled}
          onValueChange={([value]) => onConfigChange('presence_penalty', value)}
        />
      </ParameterField>

      <ParameterField
        label='Max tokens'
        description={t('Maximum number of tokens to generate')}
        icon={<Hash className='text-muted-foreground size-4' />}
        enabled={parameterEnabled.max_tokens}
        disabled={disabled}
        onToggle={() => onParameterToggle('max_tokens')}
      >
        <Input
          type='number'
          min={1}
          value={config.max_tokens}
          disabled={!parameterEnabled.max_tokens || disabled}
          onChange={(event) =>
            onConfigChange('max_tokens', Number(event.target.value) || 0)
          }
        />
      </ParameterField>

      <ParameterField
        label='Seed'
        description={t('Optional seed for reproducible outputs')}
        icon={<Shuffle className='text-muted-foreground size-4' />}
        enabled={parameterEnabled.seed}
        disabled={disabled}
        onToggle={() => onParameterToggle('seed')}
      >
        <Input
          type='number'
          value={config.seed ?? ''}
          disabled={!parameterEnabled.seed || disabled}
          onChange={(event) => {
            const raw = event.target.value.trim()
            onConfigChange('seed', raw === '' ? null : Number(raw))
          }}
        />
      </ParameterField>
    </div>
  )
}
