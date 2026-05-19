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

import { useMemo } from 'react'
import { modelToColor } from '@/lib/model-colors'
import { cn } from '@/lib/utils'
import { ORBIT_MODEL_ENTRIES } from '@/features/home/lib/orbit-models'
import { HeroEarthGlobe } from './hero-earth-globe'

interface ModelItem {
  name: string
  color: string
}

const DURATION = 28

export const MODEL_BADGE_WIDTH_PX = 112
export const MODEL_BADGE_HEIGHT_PX = 28

export function OrbitingModels() {
  const models = useMemo<ModelItem[]>(
    () =>
      ORBIT_MODEL_ENTRIES.map((entry) => ({
        name: entry.label,
        color: modelToColor(entry.colorKey),
      })),
    []
  )
  const count = models.length

  const phases = useMemo(() => {
    return models.map((_, i) => (i / count) * DURATION)
  }, [count, models])

  return (
    <div className='relative aspect-video w-full overflow-hidden rounded-lg'>
      <svg
        className='pointer-events-none absolute inset-0 h-full w-full'
        viewBox='0 0 1000 400'
        preserveAspectRatio='none'
        aria-hidden='true'
      >
        <defs>
          <path
            id='parabola-upper'
            d='M 0 300 Q 500 0 1000 300'
            fill='none'
            stroke='rgba(59, 130, 246, 0.12)'
            strokeWidth='1.5'
            strokeDasharray='8,6'
          />
          <path
            id='parabola-lower'
            d='M 0 100 Q 500 400 1000 100'
            fill='none'
            stroke='rgba(139, 92, 246, 0.12)'
            strokeWidth='1.5'
            strokeDasharray='8,6'
          />
        </defs>
        <use href='#parabola-upper' />
        <use href='#parabola-lower' />
      </svg>

      <div className='absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2'>
        <HeroEarthGlobe />
      </div>

      <div className='absolute inset-0 z-10'>
        {models.map((model, index) => (
          <ModelBadge
            key={`${model.name}-${index}`}
            model={model}
            index={index}
            phase={phases[index]}
          />
        ))}
      </div>
    </div>
  )
}

function ModelBadge(props: {
  model: ModelItem
  index: number
  phase: number
}) {
  const isUpper = props.index % 2 === 0
  const animationName = isUpper ? 'orbit-parabola-upper' : 'orbit-parabola-lower'

  return (
    <div
      className='orbiting-item'
      style={{
        animation: `${animationName} ${DURATION}s linear infinite`,
        animationDelay: `${-props.phase}s`,
      }}
    >
      <div
        className={cn('model-orbit-badge home-theme-pill')}
        style={{
          width: MODEL_BADGE_WIDTH_PX,
          height: MODEL_BADGE_HEIGHT_PX,
          ['--pill-accent' as string]: props.model.color,
        }}
      >
        <span
          className='home-theme-pill-dot shrink-0'
          style={{ backgroundColor: props.model.color }}
          aria-hidden='true'
        />
        <span className='home-theme-pill-label min-w-0 flex-1 truncate'>
          {props.model.name}
        </span>
      </div>
    </div>
  )
}
