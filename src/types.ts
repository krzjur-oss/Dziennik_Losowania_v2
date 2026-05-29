/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PoolMember {
  n: number;
  included: boolean;
}

export interface HistoryEntry {
  date: string;
  nums?: (number | '-')[];
  n1?: number | '-'; // backward compatibility
  n2?: number | '-'; // backward compatibility
}

export interface ClassItem {
  id: string;
  name: string;
  pool: PoolMember[];
  poolSize: number;
  drawCount: number;
  drawnQueue: number[];
  absent: number[];
  volunteered: number[];
  history: HistoryEntry[];
}

export interface AppState {
  classes: ClassItem[];
  activeClass: string | null;
}

export type AboutTab = 'readme' | 'updates' | 'regulamin' | 'licencja';
