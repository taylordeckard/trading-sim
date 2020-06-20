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

export interface Account {
  balance: number;
  change: {
    allTime: number;
    day: number;
    week: number;
    month: number;
  };
  shares: { [key: string]: number; };
  startingBalance: number;
  trades: Trade[];
}

export interface GameState {
  account: Account;
  currentSymbol: string;
  tabs: string[];
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
      account: null,
      currentSymbol: null,
      tabs: [],
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
    this.state.account.trades.push(trade);
    switch (trade.type) {
    case TradeType.BUY:
      this.state.account.balance -= trade.price * trade.shares;
    case TradeType.SELL:
      this.state.account.balance += trade.price * trade.shares;
    }
    this.state.account.change.allTime = this.state.account.balance - this.state.account.startingBalance;
    // TODO: day, week, month change
    this.saveState();
  }

  public set currentSymbol (symbol: string) {
    this.state.currentSymbol = symbol;
    this.saveState();
    this.currentSymbol$.next(symbol);
  }

  public set tabs (tabs: string[]) {
    this.state.tabs = tabs;
    this.saveState();
  }

  public init (startingBalance) {
    this.state.account = {
      startingBalance,
      balance: startingBalance,
      change: {
        allTime: 0,
        day: 0,
        week: 0,
        month: 0,
      },
      shares: {},
      trades: [],
    };
    this.saveState();
  }

}
