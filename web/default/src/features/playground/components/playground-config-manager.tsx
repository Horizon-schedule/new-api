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
import { useRef } from 'react'
import { Download, RotateCcw, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import useDialogState from '@/hooks/use-dialog'
import {
  exportConfigFile,
  getConfigTimestamp,
  importConfigFile,
} from '../lib'
import type { Message, PlaygroundStoredConfig } from '../types'

type PlaygroundConfigManagerProps = {
  currentConfig: PlaygroundStoredConfig
  messages: Message[]
  onConfigImport: (config: PlaygroundStoredConfig) => void
  onConfigReset: () => void
}

export function PlaygroundConfigManager({
  currentConfig,
  messages,
  onConfigImport,
  onConfigReset,
}: PlaygroundConfigManagerProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resetDialog = useDialogState()

  const handleExport = () => {
    try {
      exportConfigFile(currentConfig, messages)
      toast.success(t('Configuration exported to downloads'))
    } catch (error) {
      toast.error(
        `${t('Failed to export configuration')}: ${error instanceof Error ? error.message : ''}`
      )
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const imported = await importConfigFile(file)
      onConfigImport(imported)
      toast.success(t('Configuration imported successfully'))
    } catch (error) {
      toast.error(
        `${t('Failed to import configuration')}: ${error instanceof Error ? error.message : ''}`
      )
    }
  }

  const timestamp = getConfigTimestamp()

  return (
    <div className='space-y-3 border-t pt-3'>
      {timestamp ? (
        <p className='text-muted-foreground text-xs'>
          {t('Last saved')}: {new Date(timestamp).toLocaleString()}
        </p>
      ) : null}
      <div className='flex flex-wrap gap-2'>
        <Button type='button' variant='outline' size='sm' onClick={handleExport}>
          <Download data-icon='inline-start' />
          {t('Export')}
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload data-icon='inline-start' />
          {t('Import')}
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={resetDialog.open}
        >
          <RotateCcw data-icon='inline-start' />
          {t('Reset')}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type='file'
        accept='application/json,.json'
        className='hidden'
        onChange={handleImport}
      />
      <ConfirmDialog
        open={resetDialog.isOpen}
        onOpenChange={resetDialog.setOpen}
        title={t('Reset playground configuration?')}
        desc={t('This will restore default model settings. Messages are kept.')}
        destructive
        handleConfirm={() => {
          onConfigReset()
          resetDialog.close()
          toast.success(t('Configuration reset'))
        }}
        confirmText={t('Reset')}
      />
    </div>
  )
}
