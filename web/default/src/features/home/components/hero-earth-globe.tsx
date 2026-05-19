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

import { useId } from 'react'

const ORBIT_RINGS = [
  { size: 188, duration: 26, rotation: -18, delay: 0 },
  { size: 228, duration: 34, rotation: 12, delay: 1.2 },
  { size: 268, duration: 42, rotation: -10, delay: 2.4 },
] as const

const CONNECTION_ARCS = [
  { d: 'M36 98 C52 38 118 32 132 88', delay: 0 },
  { d: 'M48 138 C72 108 98 118 128 72', delay: 0.9 },
  { d: 'M44 58 C68 78 108 68 126 52', delay: 1.8 },
] as const

const GLOW_PINS = [
  { left: '58%', top: '22%' },
  { left: '76%', top: '44%' },
  { left: '46%', top: '70%' },
  { left: '30%', top: '42%' },
] as const

export function HeroEarthGlobe() {
  const uid = useId().replace(/:/g, '')

  return (
    <div className='earth-hero-root relative flex size-[168px] items-center justify-center sm:size-[184px] md:size-[200px]'>
      <div
        className='earth-hero-halo pointer-events-none absolute inset-0 rounded-full'
        aria-hidden='true'
      />

      <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
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

      <div className='earth-hero-core earth-hero-intro relative z-10'>
        <div className='earth-hero-globe'>
          <svg
            viewBox='0 0 200 200'
            className='block size-full'
            aria-hidden='true'
            role='img'
          >
            <defs>
              <radialGradient id={`${uid}-ocean`} cx='32%' cy='28%' r='68%'>
                <stop offset='0%' stopColor='#5eead4' stopOpacity={0.95} />
                <stop offset='38%' stopColor='#0ea5e9' />
                <stop offset='72%' stopColor='#1d4ed8' />
                <stop offset='100%' stopColor='#020617' />
              </radialGradient>
              <radialGradient id={`${uid}-shine`} cx='28%' cy='22%' r='45%'>
                <stop offset='0%' stopColor='#ffffff' stopOpacity={0.55} />
                <stop offset='55%' stopColor='#ffffff' stopOpacity={0.08} />
                <stop offset='100%' stopColor='#ffffff' stopOpacity={0} />
              </radialGradient>
              <linearGradient
                id={`${uid}-rim`}
                x1='0%'
                y1='0%'
                x2='100%'
                y2='100%'
              >
                <stop offset='0%' stopColor='#67e8f9' stopOpacity={0.9} />
                <stop offset='50%' stopColor='#818cf8' stopOpacity={0.35} />
                <stop offset='100%' stopColor='#22d3ee' stopOpacity={0.15} />
              </linearGradient>
              <clipPath id={`${uid}-sphere`}>
                <circle cx='100' cy='100' r='76' />
              </clipPath>
              <filter
                id={`${uid}-glow`}
                x='-40%'
                y='-40%'
                width='180%'
                height='180%'
              >
                <feGaussianBlur stdDeviation='4' result='blur' />
                <feMerge>
                  <feMergeNode in='blur' />
                  <feMergeNode in='SourceGraphic' />
                </feMerge>
              </filter>
            </defs>

            <circle
              cx='100'
              cy='100'
              r='92'
              fill='none'
              stroke={`url(#${uid}-rim)`}
              strokeWidth='1.25'
              opacity={0.65}
            />
            <circle
              cx='100'
              cy='100'
              r='88'
              fill='none'
              stroke='#67e8f9'
              strokeWidth='0.5'
              opacity={0.2}
            />

            <circle
              cx='100'
              cy='100'
              r='76'
              fill={`url(#${uid}-ocean)`}
              filter={`url(#${uid}-glow)`}
            />
            <circle
              cx='100'
              cy='100'
              r='76'
              fill={`url(#${uid}-shine)`}
            />

            <g clipPath={`url(#${uid}-sphere)`} className='earth-hero-spin'>
              <g opacity={0.22} stroke='#e0f2fe' strokeWidth='0.65' fill='none'>
                <ellipse cx='100' cy='100' rx='76' ry='22' />
                <ellipse cx='100' cy='100' rx='76' ry='40' />
                <ellipse cx='100' cy='100' rx='76' ry='58' />
                <line x1='24' y1='100' x2='176' y2='100' />
                <line x1='100' y1='24' x2='100' y2='176' />
              </g>

              <path
                d='M44 92 C58 72 82 66 104 70 C126 74 138 88 132 104 C118 118 88 120 62 110 Z'
                fill='rgba(52,211,153,0.42)'
              />
              <path
                d='M72 48 C88 42 108 46 118 58 C108 68 86 72 70 64 Z'
                fill='rgba(34,197,94,0.38)'
              />
              <path
                d='M118 118 C132 112 148 118 152 132 C140 142 120 138 112 126 Z'
                fill='rgba(16,185,129,0.35)'
              />

              {CONNECTION_ARCS.map((route, index) => (
                <path
                  key={index}
                  className='earth-route'
                  d={route.d}
                  style={{ animationDelay: `${route.delay}s` }}
                />
              ))}
            </g>

            <ellipse
              cx='78'
              cy='72'
              rx='22'
              ry='14'
              fill='rgba(255,255,255,0.14)'
              transform='rotate(-24 78 72)'
            />
          </svg>
        </div>

        {GLOW_PINS.map((pin, index) => (
          <span
            key={index}
            className='earth-pin earth-pin-pulse'
            style={{ left: pin.left, top: pin.top }}
          />
        ))}
      </div>
    </div>
  )
}
