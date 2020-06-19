import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

enum TradeType { BUY, SELL }

export interface Trade {
  timestamp: string;
  symbol: string;
  shares: number;
  price: number;
  type: TradeType;
}

export interface GameState {
  balance: number;
  change: {
    allTime: number;
    day: number;
    week: number;
    month: number;
  };
  currentSymbol: string;
  shares: { [key: string]: number; };
  startingBalance,
  trades: Trade[];
}

const STATE_STORAGE_KEY = 'trading-sim-game-state';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {

  public state$: BehaviorSubject<GameState>;
  public readonly state: GameState;
  public currentSymbol$: BehaviorSubject<string>;

  constructor () {
    const initState = {
      balance: 0,
      change: {
        allTime: 0,
        day: 0,
        week: 0,
        mongth: 0,
      },
      currentSymbol: 'ALPN',
      shares: {},
      startingBalance: 0,
      trades: [],
    }
    try {
      this.state = JSON.parse(localStorage.getItem(STATE_STORAGE_KEY)) || initState;
      this.state$ = new BehaviorSubject<GameState>(this.state);
      this.currentSymbol$ = new BehaviorSubject<string>(this.state.currentSymbol);
    } catch (e) { }
  }

  private saveState () {
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(this.state));
    this.state$.next(this.state);
  }

  public trade (trade: Trade) {
    this.state.trades.push(trade);
    switch (trade.type) {
    case TradeType.BUY:
      this.state.balance -= trade.price * trade.shares;
    case TradeType.SELL:
      this.state.balance += trade.price * trade.shares;
    }
    this.state.change.allTime = this.state.balance - this.state.startingBalance;
    // TODO: day, week, month change
    this.saveState();
  }

  public set currentSymbol (symbol: string) {
    this.state.currentSymbol = symbol;
    this.saveState();
    this.currentSymbol$.next(symbol);
  }

}
