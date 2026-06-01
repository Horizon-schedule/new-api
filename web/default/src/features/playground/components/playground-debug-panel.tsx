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
import { Clock, Code, Eye, Send, X, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DebugTabId, PlaygroundDebugData } from '../types'
import { PlaygroundCodeViewer } from './playground-code-viewer'

type PlaygroundDebugPanelProps = {
  debugData: PlaygroundDebugData
  activeTab: DebugTabId
  customRequestMode: boolean
  onActiveTabChange: (tab: DebugTabId) => void
  onClose?: () => void
  className?: string
}

export function PlaygroundDebugPanel({
  debugData,
  activeTab,
  customRequestMode,
  onActiveTabChange,
  onClose,
  className,
}: PlaygroundDebugPanelProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'bg-card flex h-full flex-col overflow-hidden border-l',
        className
      )}
    >
      <div className='flex items-center justify-between border-b px-4 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-500'>
            <Code className='size-5 text-white' />
          </div>
          <h2 className='text-base font-semibold'>{t('Debug information')}</h2>
        </div>
        {onClose ? (
          <Button type='button' variant='ghost' size='icon' onClick={onClose}>
            <X className='size-4' />
          </Button>
        ) : null}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => onActiveTabChange(value as DebugTabId)}
        className='flex min-h-0 flex-1 flex-col gap-0'
      >
        <TabsList className='mx-4 mt-4 grid w-auto grid-cols-3'>
          <TabsTrigger value='preview' className='gap-1.5 text-xs'>
            <Eye className='size-3.5' />
            {t('Preview request body')}
            {customRequestMode ? (
              <Badge variant='secondary' className='ml-1 px-1.5 py-0 text-[10px]'>
                {t('Custom')}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value='request' className='gap-1.5 text-xs'>
            <Send className='size-3.5' />
            {t('Actual request body')}
          </TabsTrigger>
          <TabsTrigger value='response' className='gap-1.5 text-xs'>
            <Zap className='size-3.5' />
            {t('Response')}
            {debugData.sseMessages.length > 0 ? (
              <Badge variant='secondary' className='ml-1 px-1.5 py-0 text-[10px]'>
                SSE {debugData.sseMessages.length}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='preview' className='min-h-0 flex-1 px-4 pb-4'>
          <PlaygroundCodeViewer content={debugData.previewRequest} className='h-[calc(100vh-220px)]' />
        </TabsContent>
        <TabsContent value='request' className='min-h-0 flex-1 px-4 pb-4'>
          <PlaygroundCodeViewer content={debugData.request} className='h-[calc(100vh-220px)]' />
        </TabsContent>
        <TabsContent value='response' className='min-h-0 flex-1 px-4 pb-4'>
          <PlaygroundCodeViewer
            content={
              debugData.sseMessages.length > 0
                ? debugData.sseMessages.join('\n')
                : debugData.response
            }
            className='h-[calc(100vh-220px)]'
          />
        </TabsContent>
      </Tabs>

      <div className='text-muted-foreground flex items-center gap-2 border-t px-4 py-3 text-xs'>
        <Clock className='size-3.5' />
        {activeTab === 'preview' && debugData.previewTimestamp
          ? `${t('Preview updated')}: ${new Date(debugData.previewTimestamp).toLocaleString()}`
          : debugData.timestamp
            ? `${t('Last request')}: ${new Date(debugData.timestamp).toLocaleString()}`
            : t('No requests yet')}
      </div>
    </div>
  )
}
