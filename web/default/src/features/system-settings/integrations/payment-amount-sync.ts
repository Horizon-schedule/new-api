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

import { safeJsonParseWithValidation } from '../utils/json-parser'
import { isArray } from '../utils/json-validators'

/** 解析后台「充值金额选项」JSON 数组 */
export function parseAmountOptionsJson(value: string): number[] {
  const parsed = safeJsonParseWithValidation<unknown[]>(value, {
    fallback: [],
    validator: isArray,
    silent: true,
  })

  return parsed
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0)
    .sort((a, b) => a - b)
}

function uniqueSortedAmounts(amounts: number[]): number[] {
  return [...new Set(amounts)].sort((a, b) => a - b)
}

/** 向充值金额选项中追加一档（若已存在则不变） */
export function addAmountOptionJson(value: string, amount: number): string {
  const amounts = uniqueSortedAmounts([
    ...parseAmountOptionsJson(value),
    amount,
  ])
  return JSON.stringify(amounts, null, 2)
}

/** 从充值金额选项中移除一档 */
export function removeAmountOptionJson(value: string, amount: number): string {
  const amounts = parseAmountOptionsJson(value).filter((item) => item !== amount)
  return JSON.stringify(amounts, null, 2)
}
