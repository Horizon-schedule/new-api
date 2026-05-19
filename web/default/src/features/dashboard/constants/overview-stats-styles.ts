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
/**
 * Dashboard overview stat card styles — aligned with web/classic StatsCards.
 */
export const OVERVIEW_STAT_GROUP_STYLES = [
  {
    cardClass:
      'border-0 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-900/30',
    itemIconClasses: [
      'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300',
      'bg-purple-100 text-purple-600 dark:bg-purple-900/60 dark:text-purple-300',
    ],
    trendColors: ['#3b82f6', '#8b5cf6'],
  },
  {
    cardClass:
      'border-0 bg-green-50 dark:bg-green-950/40 dark:border-green-900/30',
    itemIconClasses: [
      'bg-green-100 text-green-600 dark:bg-green-900/60 dark:text-green-300',
      'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/60 dark:text-cyan-300',
    ],
    trendColors: ['#10b981', '#06b6d4'],
  },
  {
    cardClass:
      'border-0 bg-yellow-50 dark:bg-yellow-950/35 dark:border-yellow-900/30',
    itemIconClasses: [
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300',
      'bg-pink-100 text-pink-600 dark:bg-pink-900/60 dark:text-pink-300',
    ],
    trendColors: ['#f59e0b', '#ec4899'],
  },
  {
    cardClass:
      'border-0 bg-indigo-50 dark:bg-indigo-950/40 dark:border-indigo-900/30',
    itemIconClasses: [
      'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-300',
      'bg-orange-100 text-orange-600 dark:bg-orange-900/60 dark:text-orange-300',
    ],
    trendColors: ['#6366f1', '#f97316'],
  },
] as const
