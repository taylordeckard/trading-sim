import { Long } from 'long';

export interface FinnhubTrade {
  p: number,
  s: string,
  t: number,
  v: number,
}

export interface FinnhubResponse {
  data: FinnhubTrade[],
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
  lastDayPV?: number;
  lastDayVolume: number;
  low: number,
  open: number, 
  timestamp: number,
  volume: number,
  vwap?: number;
}

export enum TradeType { BUY, SELL }

export interface Trade {
  timestamp: string;
  symbol: string;
  shares: number;
  price: number;
  type: TradeType;
}

export interface Account {
  balance: number;
  change: {
    allTime: number;
    day: number;
    week: number;
    month: number;
  };
  shareDetails: { [key: string]: { shares: number, cost: number }[]; };
  shares: { [key: string]: number; };
  startingBalance: number;
  trades: Trade[];
}

export interface GameState {
  account: Account;
  currentSymbol: string;
  currentPrice: { [key: string]: number };
  tabs: string[];
}

