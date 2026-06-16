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
 * Theme customization constants and types.
 *
 * Lives in `lib/` (not `context/`) so it can be imported alongside the
 * provider without breaking React Fast Refresh boundaries.
 */

/** Curated single-tone color presets (matches theme-presets.css). */
export const THEME_PRESETS = [
  {
    value: 'default',
    name: 'Default',
    color: 'oklch(0.55 0 0)',
  },
  {
    value: 'indigo',
    name: 'Indigo',
    color: 'oklch(0.511 0.262 276.966)',
  },
  {
    value: 'ocean-breeze',
    name: 'Ocean Breeze',
    color: 'oklch(0.5461 0.2152 262.88)',
  },
  {
    value: 'emerald',
    name: 'Emerald',
    color: 'oklch(0.596 0.145 163.225)',
  },
  {
    value: 'amber',
    name: 'Amber',
    color: 'oklch(0.769 0.188 70.08)',
  },
  {
    value: 'crimson',
    name: 'Crimson',
    color: 'oklch(0.577 0.245 27.325)',
  },
] as const

export type ThemePreset = (typeof THEME_PRESETS)[number]['value']
export type ThemeRadius = 'default' | 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type ThemeScale = 'default' | 'sm' | 'lg'
export type ContentLayout = 'full' | 'centered'

export type ThemeCustomization = {
  preset: ThemePreset
  radius: ThemeRadius
  scale: ThemeScale
  contentLayout: ContentLayout
}

export const DEFAULT_THEME_CUSTOMIZATION: ThemeCustomization = {
  preset: 'default',
  radius: 'default',
  scale: 'default',
  contentLayout: 'full',
}

export const THEME_PRESET_VALUES = new Set(
  THEME_PRESETS.map((p) => p.value)
) as ReadonlySet<ThemePreset>

/** Map retired presets to the closest supported palette. */
export const LEGACY_THEME_PRESET_ALIASES: Record<string, ThemePreset> = {
  underground: 'default',
  'rose-garden': 'crimson',
  'lake-view': 'emerald',
  'sunset-glow': 'amber',
  'forest-whisper': 'emerald',
  'lavender-dream': 'indigo',
  midnight: 'indigo',
  coral: 'crimson',
  violet: 'indigo',
  slate: 'default',
}

export function resolveThemePreset(value: string | undefined): ThemePreset {
  if (!value) return DEFAULT_THEME_CUSTOMIZATION.preset
  if (THEME_PRESET_VALUES.has(value as ThemePreset)) {
    return value as ThemePreset
  }
  return LEGACY_THEME_PRESET_ALIASES[value] ?? DEFAULT_THEME_CUSTOMIZATION.preset
}

export const THEME_RADIUS_VALUES: ReadonlySet<ThemeRadius> = new Set([
  'default',
  'none',
  'sm',
  'md',
  'lg',
  'xl',
])

export const THEME_SCALE_VALUES: ReadonlySet<ThemeScale> = new Set([
  'default',
  'sm',
  'lg',
])

export const CONTENT_LAYOUT_VALUES: ReadonlySet<ContentLayout> = new Set([
  'full',
  'centered',
])

export const THEME_COOKIE_KEYS = {
  preset: 'theme_preset',
  radius: 'theme_radius',
  scale: 'theme_scale',
  contentLayout: 'theme_content_layout',
} as const
