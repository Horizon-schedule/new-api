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

interface ModelItem {
  name: string
  color: string
}

const MODELS: ModelItem[] = [
  { name: 'GPT-4', color: '#10a937' },
  { name: 'GPT-4o', color: '#10a937' },
  { name: 'o1', color: '#10a937' },
  { name: 'Claude 3', color: '#d97706' },
  { name: 'Claude 4', color: '#d97706' },
  { name: 'Gemini', color: '#4285f4' },
  { name: 'Gemini Pro', color: '#4285f4' },
  { name: 'Llama 4', color: '#0ea5e9' },
  { name: 'Mistral', color: '#9d4edd' },
  { name: 'DeepSeek', color: '#06b6d4' },
  { name: '智谱 GLM', color: '#14b8a6' },
  { name: '通义千问', color: '#f59e0b' },
  { name: '百度文心', color: '#ef4444' },
  { name: '讯飞星火', color: '#8b5cf6' },
  { name: 'DALL-E', color: '#06b6d4' },
  { name: 'Sora', color: '#0ea5e9' },
  { name: 'Kling', color: '#f59e0b' },
  { name: 'Cohere', color: '#14b8a6' },
  { name: 'Perplexity', color: '#8b5cf6' },
]

const DURATION = 28 // seconds for a full loop

export function OrbitingModels() {
  const count = MODELS.length

  // evenly spaced phase offsets to increase spacing
  const phases = useMemo(() => {
    return MODELS.map((_, i) => (i / count) * DURATION)
  }, [count])

  return (
    <div className='relative w-full aspect-video overflow-hidden rounded-lg'>
      {/* SVG paths (visual guides) */}
      <svg
        className='absolute inset-0 w-full h-full pointer-events-none'
        viewBox='0 0 1000 400'
        preserveAspectRatio='none'
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

      {/* Center rotating Earth with rays */}
      <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20'>
        <Earth />
      </div>

      {/* Model badges */}
      <div className='absolute inset-0 z-10'>
        {MODELS.map((model, index) => (
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

function ModelBadge({
  model,
  index,
  phase,
}: {
  model: ModelItem
  index: number
  phase: number
}) {
  const isUpper = index % 2 === 0
  const animationName = isUpper ? 'orbit-parabola-upper' : 'orbit-parabola-lower'

  return (
    <div
      className='orbiting-item'
      style={{
        animation: `${animationName} ${DURATION}s linear infinite`,
        animationDelay: `${-phase}s`,
      } as any}
    >
      <div
        className='flex flex-col items-center gap-1 rounded-lg border px-3 py-1 backdrop-blur-sm transition-transform will-change-transform hover:scale-110'
        style={{
            borderColor: model.color,
            backgroundColor: `${model.color}22`,
            borderWidth: '1px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
          } as any}
      >
        <div
          className='h-1.5 w-1.5 rounded-full'
          style={{ backgroundColor: model.color }}
        />
        <span className='font-semibold text-white leading-none text-[11px]'>
          {model.name}
        </span>
      </div>
    </div>
  )
}

const ORBIT_RINGS = [
  { size: 170, duration: 24, rotation: -20, delay: 0 },
  { size: 210, duration: 32, rotation: 14, delay: 1.5 },
  { size: 250, duration: 40, rotation: -12, delay: 3 },
]

const EARTH_PINS = [
  { left: '60%', top: '20%' },
  { left: '78%', top: '42%' },
  { left: '48%', top: '72%' },
  { left: '28%', top: '40%' },
]

const EARTH_ROUTES = [
  {
    d: 'M28 70 C40 22 100 22 112 70',
    delay: 0,
  },
  {
    d: 'M38 106 C64 92 86 82 110 46',
    delay: 0.8,
  },
  {
    d: 'M36 44 C58 62 84 76 110 62',
    delay: 1.6,
  },
]

function Earth() {
  return (
    <div className='relative flex items-center justify-center'>
      <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
        {ORBIT_RINGS.map((ring, index) => (
          <div
            key={index}
            className='orbit-track'
            style={{
              width: ring.size,
              height: ring.size,
              animationDuration: `${ring.duration}s`,
              transform: `rotate(${ring.rotation}deg)`,
              animationDelay: `${ring.delay}s`,
            }}
          />
        ))}
      </div>

      <div className='earth-shell'>
        <div className='earth-globe'>
          <svg viewBox='0 0 140 140' className='block w-full h-full'>
            <defs>
              <radialGradient id='g-planet' cx='35%' cy='35%'>
                <stop offset='0%' stopColor='#84d8ff' />
                <stop offset='60%' stopColor='#3baeda' />
                <stop offset='100%' stopColor='#071e34' />
              </radialGradient>
            </defs>
            <circle cx='70' cy='70' r='56' fill='url(#g-planet)' />
            <path
              d='M32 72C42 56 58 42 78 46C96 50 110 60 106 76C100 98 84 100 66 94C46 86 34 88 32 72Z'
              fill='rgba(255,255,255,0.18)'
            />
            <path
              d='M50 32C64 40 86 32 98 46C110 60 98 76 78 74C56 72 44 66 50 32Z'
              fill='rgba(255,255,255,0.16)'
            />

            {EARTH_ROUTES.map((route, index) => (
              <path
                key={index}
                className='earth-route'
                d={route.d}
                style={{ animationDelay: `${route.delay}s` }}
              />
            ))}
          </svg>
        </div>

        {EARTH_PINS.map((pin, index) => (
          <span
            key={index}
            className='earth-pin'
            style={{ left: pin.left, top: pin.top }}
          />
        ))}
      </div>
    </div>
  )
}
