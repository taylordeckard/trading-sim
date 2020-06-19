import { Long } from 'long';

export interface Trade {
  p: number,
  s: string,
  t: number,
  v: number,
}
export interface StockResponse {
  data: Trade[],
  type: 'trade',
}

export interface PricingData {
  id: string,
  price: number,
  time: Long,
  exchange: string,
  quoteType: string,
  marketHours: string,
  changePercent: number,
  dayVolume: Long,
  change: number,
  priceHint: Long, 
}

export interface Frame {
  close: number,
  high: number,
  last: number;
  lastDayVolume: number;
  low: number,
  open: number, 
  timestamp: number,
  volume: number,
}
