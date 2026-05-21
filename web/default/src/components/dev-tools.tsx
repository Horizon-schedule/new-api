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
import { lazy, Suspense } from 'react'

const LazyReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then((m) => ({
    default: m.ReactQueryDevtools,
  }))
)

const LazyRouterDevtools = lazy(() =>
  import('@tanstack/react-router-devtools').then((m) => ({
    default: m.TanStackRouterDevtools,
  }))
)

/** 懒加载 Devtools，避免 chunk 加载失败拖垮整页 */
export function DevTools() {
  if (import.meta.env.MODE !== 'development') return null

  return (
    <Suspense fallback={null}>
      <LazyReactQueryDevtools buttonPosition='bottom-left' />
      <LazyRouterDevtools position='bottom-right' />
    </Suspense>
  )
}
