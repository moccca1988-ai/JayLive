export type DropStatus = 'ACTIVE' | 'FULL' | 'ENDED';

export interface Drop {
  id: string;
  host_id: string;
  title: string;
  description?: string;
  price?: string;
  status: DropStatus;
  created_at: number;
}

export interface DropOption {
  id: string;
  drop_id: string;
  option_label: string;
  option_value: string;
  stock: number;
  reserved: number;
}

export interface DropReservation {
  id: string;
  drop_id: string;
  user_id: string;
  option_value: string;
  position: number;
  created_at: number;
  contacted?: boolean;
}

const globalForDb = globalThis as unknown as {
  __LIVE_DROPS_DB: {
    drops: Drop[];
    drop_options: DropOption[];
    drop_reservations: DropReservation[];
  };
};

export const db = globalForDb.__LIVE_DROPS_DB || {
  drops: [],
  drop_options: [],
  drop_reservations: [],
};

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__LIVE_DROPS_DB = db;
}
