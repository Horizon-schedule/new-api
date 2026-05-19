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
*/

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { modelToColor } from '@/lib/model-colors'
import { cn } from '@/lib/utils'
import {
  HERO_AI_PROVIDERS,
  HERO_LOGO_PROVIDERS,
  type HeroAIProvider,
} from '@/features/home/lib/ai-providers'
const ROTATE_MS = 6000

export function HeroModelShowcase() {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState(HERO_AI_PROVIDERS[0]?.id ?? '')
  const [paused, setPaused] = useState(false)
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const activeProvider =
    HERO_AI_PROVIDERS.find((p) => p.id === activeId) ?? HERO_AI_PROVIDERS[0]

  const selectProvider = useCallback((id: string) => {
    setActiveId(id)
    requestAnimationFrame(() => {
      cardRefs.current[id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    })
  }, [])

  useEffect(() => {
    if (paused) return

    const timer = window.setInterval(() => {
      setActiveId((current) => {
        const index = HERO_AI_PROVIDERS.findIndex((p) => p.id === current)
        const next =
          HERO_AI_PROVIDERS[(index + 1) % HERO_AI_PROVIDERS.length]
        const nextId = next?.id ?? current

        return nextId
      })
    }, ROTATE_MS)

    return () => window.clearInterval(timer)
  }, [paused])

  return (
    <div className='hero-showcase w-full space-y-5 sm:space-y-6'>
      <div className='text-center'>
        <p className='text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase'>
          {t('Supported AI Providers')}
        </p>
        <div className='flex flex-wrap items-center justify-center gap-2 sm:gap-2.5'>
          {HERO_LOGO_PROVIDERS.map((provider) => (
            <ProviderLogoTile
              key={provider.id}
              name={provider.name}
              icon={provider.icon}
              active={provider.id === activeId}
              onClick={() => selectProvider(provider.id)}
            />
          ))}
          <MoreProvidersBadge />
        </div>
      </div>

      <div className='hero-showcase-panel-bleed'>
        <div
          className='hero-showcase-panel relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-4 shadow-sm backdrop-blur-md sm:rounded-3xl sm:p-6 dark:bg-card/25'
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setPaused(false)
            }
          }}
        >
        <div className='relative z-10 space-y-4'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <p className='text-muted-foreground text-xs font-medium tracking-widest uppercase'>
                {t('Popular models')}
              </p>
              <h3 className='mt-1 text-lg font-semibold tracking-tight sm:text-xl'>
                {activeProvider?.name}
              </h3>
            </div>
            <p className='text-muted-foreground text-xs sm:max-w-[220px] sm:text-right'>
              {t('One unified API for every provider')}
            </p>
          </div>

          {activeProvider ? (
            <ActiveProviderSpotlight
              key={activeProvider.id}
              provider={activeProvider}
            />
          ) : null}

          <div
            className={cn(
              'hero-provider-grid grid w-full gap-2 sm:gap-2.5',
              'grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
            )}
          >
            {HERO_AI_PROVIDERS.map((provider) => (
              <ProviderModelCard
                key={provider.id}
                ref={(el) => {
                  cardRefs.current[provider.id] = el
                }}
                provider={provider}
                active={provider.id === activeId}
                onSelect={() => selectProvider(provider.id)}
              />
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

function ProviderLogoTile(props: {
  name: string
  icon: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type='button'
      title={props.name}
      onClick={props.onClick}
      className={cn(
        'provider-logo-tile flex size-12 items-center justify-center rounded-2xl border transition-all duration-200 sm:size-14',
        'bg-card shadow-sm hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        props.active
          ? 'border-foreground/30 ring-foreground/15 scale-105 shadow-md ring-2'
          : 'border-border/60 hover:border-border'
      )}
    >
      <span className='flex items-center justify-center [&_svg]:size-7 sm:[&_svg]:size-8'>
        {getLobeIcon(props.icon, 32)}
      </span>
    </button>
  )
}

function MoreProvidersBadge() {
  const { t } = useTranslation()
  return (
    <div
      className='provider-logo-tile flex size-12 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 sm:size-14'
      title={t('And more providers')}
    >
      <span className='text-muted-foreground text-sm font-semibold tracking-widest'>
        ...
      </span>
    </div>
  )
}

function ActiveProviderSpotlight(props: { provider: HeroAIProvider }) {
  const accent = modelToColor(props.provider.colorKey)

  return (
    <div
      className='hero-spotlight-enter flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5'
      style={{
        borderColor: `color-mix(in oklch, ${accent} 35%, var(--border))`,
        background: `color-mix(in oklch, ${accent} 8%, var(--card))`,
      }}
    >
      <div className='flex items-center gap-3'>
        <div className='flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm'>
          {getLobeIcon(props.provider.icon, 28)}
        </div>
        <div className='min-w-0'>
          <p className='text-muted-foreground text-xs'>{props.provider.name}</p>
          <p className='truncate text-sm font-medium'>
            {props.provider.models.map((m) => m.label).join(' · ')}
          </p>
        </div>
      </div>
      <div className='flex flex-wrap gap-1.5'>
        {props.provider.models.map((model) => (
          <ModelPill
            key={model.label}
            label={model.label}
            colorKey={model.colorKey}
            size='md'
          />
        ))}
      </div>
    </div>
  )
}

const ProviderModelCard = forwardRef<
  HTMLButtonElement,
  {
    provider: HeroAIProvider
    active: boolean
    onSelect: () => void
  }
>(function ProviderModelCard(props, ref) {
  const accent = modelToColor(props.provider.colorKey)

  return (
    <button
      ref={ref}
      type='button'
      onClick={props.onSelect}
      className={cn(
        'provider-model-card w-full min-w-0 text-left rounded-xl border p-3 transition-all duration-200',
        'bg-card/80 hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        props.active
          ? 'border-foreground/25 shadow-md ring-1 ring-foreground/10'
          : 'border-border/50 hover:border-border'
      )}
      style={
        props.active
          ? {
              borderColor: `color-mix(in oklch, ${accent} 40%, var(--border))`,
              background: `color-mix(in oklch, ${accent} 6%, var(--card))`,
            }
          : undefined
      }
    >
      <div className='mb-2 flex items-center gap-2'>
        <span className='flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-background/80'>
          {getLobeIcon(props.provider.icon, 20)}
        </span>
        <span className='truncate text-xs font-semibold sm:text-sm'>
          {props.provider.name}
        </span>
      </div>
      <div className='flex flex-col gap-1'>
        {props.provider.models.map((model) => (
          <ModelPill
            key={model.label}
            label={model.label}
            colorKey={model.colorKey}
            size='sm'
          />
        ))}
      </div>
    </button>
  )
})

function ModelPill(props: {
  label: string
  colorKey: string
  size?: 'sm' | 'md'
}) {
  const accent = modelToColor(props.colorKey)

  return (
    <span
      className={cn(
        'home-theme-pill model-orbit-badge inline-flex w-full min-w-0 items-center gap-1',
        props.size === 'md' ? 'h-7 px-2.5 text-[11px]' : 'h-6 px-2 text-[10px]'
      )}
      style={{ ['--pill-accent' as string]: accent }}
    >
      <span
        className='home-theme-pill-dot shrink-0'
        style={{ backgroundColor: accent }}
        aria-hidden='true'
      />
      <span className='home-theme-pill-label truncate' title={props.label}>
        {props.label}
      </span>
    </span>
  )
}
