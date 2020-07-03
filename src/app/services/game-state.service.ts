import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameState, Trade, TradeType } from '../types';

const STATE_STORAGE_KEY = 'trading-sim-game-state';

type StockPriceSubjects = { [key: string]: BehaviorSubject<number> };

@Injectable({
  providedIn: 'root',
})
export class GameStateService {

  public state$: BehaviorSubject<GameState>;
  public readonly state: GameState;
  public currentPrice$: StockPriceSubjects;
  public averageCost$: StockPriceSubjects;
  public currentSymbol$: BehaviorSubject<string>;
  public worth$: BehaviorSubject<number>;

  constructor () {
    const initState = {
      account: null,
      currentSymbol: null,
	  currentPrice: {},
      tabs: [],
    }
    try {
      this.state = JSON.parse(localStorage.getItem(STATE_STORAGE_KEY)) || initState;
      this.state$ = new BehaviorSubject<GameState>(this.state);
      this.currentPrice$ = {};
      this.averageCost$ = {};
      this.currentSymbol$ = new BehaviorSubject<string>(this.state.currentSymbol);
	  this.worth$ = new BehaviorSubject<number>(this.calculateWorth());
      this.initSubjects();
    } catch (e) { }
  }

  private saveState () {
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(this.state));
    this.state$.next(this.state);
  }

  public trade (trade: Trade) {
    this.state.account.trades.push(trade);
    if (!this.state.account.shares[trade.symbol]) {
      this.state.account.shares[trade.symbol] = 0;
    }
    if (!this.state.account.shareDetails[trade.symbol]) {
      this.state.account.shareDetails[trade.symbol] = [];
    }
    const value = trade.price * trade.shares;
    switch (trade.type) {
    case TradeType.BUY:
      this.state.account.balance -= value;
      this.state.account.shareDetails[trade.symbol].push({ shares: trade.shares, cost: trade.price });
      this.state.account.shares[trade.symbol] += trade.shares;
      break;
    case TradeType.SELL:
      this.state.account.balance += value;
      this.sellShares(trade.symbol, trade.shares);
      this.state.account.shares[trade.symbol] -= trade.shares;
      if (this.state.account.shares[trade.symbol] === 0)  {
        this.state.account.shareDetails[trade.symbol] = [];
      }
    }
    this.updateAverageCost(trade.symbol);
    this.state.account.change.allTime = this.state.account.balance - this.state.account.startingBalance;
    // TODO: day, week, month change
    this.saveState();
  }

  public set currentSymbol (symbol: string) {
    this.state.currentSymbol = symbol;
    this.saveState();
    this.currentSymbol$.next(symbol);
  }

  public setCurrentPrice (symbol: string, price: number) {
    this.state.currentPrice[symbol] = price;
    this.saveState();
	if (!this.currentPrice$[symbol]) {
		this.currentPrice$[symbol] = new BehaviorSubject(price);
	}
    this.currentPrice$[symbol].next(price);
    this.worth$.next(this.calculateWorth());
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
	  shareDetails: {},
      shares: {},
      trades: [],
    };
    this.saveState();
  }

  public reset () {
    this.state.account = null;
    this.saveState();
  }

  private calculateWorth () {
	  const bal = this.state.account.balance;
	  const inv = Object.keys(this.state.currentPrice).reduce((memo, key) => {
		  if (this.state.account.shares[key]) {
			  memo += this.state.currentPrice[key] * this.state.account.shares[key];
		  }

		  return memo;
	  }, 0);
	  return bal + inv;
  }

  private updateAverageCost (symbol: string) {
    const averageCost =  this.getCostOfAllShares(symbol) /
      this.state.account.shares[symbol];
    if (!this.averageCost$[symbol]) {
      this.averageCost$[symbol] =
        new BehaviorSubject<number>(averageCost);
    }
    this.averageCost$[symbol].next(averageCost);
  }

  private initSubjects () {
    Object.keys(this.state.account.shares).forEach(symbol => {
      this.updateAverageCost(symbol);
    });
  }

  private getCostOfAllShares (symbol: string) {
    return this.state.account.shareDetails[symbol].reduce((acc, d) => {
      acc += d.cost * d.shares;
      return acc;
    }, 0);
  }

  private sellShares (symbol: string, numShares: number) {
    let sharesLeft = numShares;
    this.state.account.shareDetails[symbol] = this.state.account.shareDetails[symbol]
      .reduce((acc, d) => {
        if (sharesLeft < d.shares) {
          const diff = d.shares - sharesLeft;
          acc.push({ shares: diff, cost: d.cost });
        }
        sharesLeft -= d.shares;
        return acc;
      }, []);
  }

}
