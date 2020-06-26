import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { A, Z } from '@angular/cdk/keycodes';
import { CollectorService, ErrorService, GameStateService } from '../services';
import { TradeType } from '../types';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
})
export class ControlsComponent implements OnInit {

  public sharesFC = new FormControl(1000, [Validators.required, Validators.min(1)]);
  public state$ = this.gameState.state$;
  @HostListener('document:keydown', ['$event'])
  onKeydown(event) {
    if (event.repeat) { return; }
    // Cmd-A executes a buy
    if (event.metaKey && event.keyCode === A) {
      event.preventDefault();
      this.buy();
    }
    // Cmd-Z executes a sell
    if (event.metaKey && event.keyCode === Z) {
      event.preventDefault();
      this.sell();
    }
    // Shift-Cmd-Z executes a sell all
    if (event.shiftKey && event.metaKey && event.keyCode === Z) {
      event.preventDefault();
      this.sellAll();
    }
  }

  constructor(
    private collector: CollectorService,
    private error: ErrorService,
    public gameState: GameStateService,
  ) { }

  ngOnInit(): void {
  }
  
  public buy () {
    const symbol = this.gameState.state.currentSymbol;
    const currentPrice = this.collector.getCurrentPrice(symbol);
    const debit = this.sharesFC.value * currentPrice;
    if (this.gameState.state.account.balance >= debit) {
      this.gameState.trade({
        symbol,
        timestamp: Date.now().toString(),
        shares: this.sharesFC.value,
        price: currentPrice,
        type: TradeType.BUY,
      })
    } else {
      this.error.open('Not enough funds');
    }
  }

  public sell () {
    const symbol = this.gameState.state.currentSymbol;
    if (this.gameState.state.account.shares[symbol] >= this.sharesFC.value) {
      this.gameState.trade({
        symbol,
        timestamp: Date.now().toString(),
        shares: this.sharesFC.value,
        price: this.collector.getCurrentPrice(symbol),
        type: TradeType.SELL,
      })
    } else {
      this.error.open('Not enough shares');
    }
  }

  public sellAll () {
    const symbol = this.gameState.state.currentSymbol;
    if (this.gameState.state.account.shares[symbol]) {
      this.gameState.trade({
        symbol,
        timestamp: Date.now().toString(),
        shares: this.gameState.state.account.shares[symbol],
        price: this.collector.getCurrentPrice(symbol),
        type: TradeType.SELL,
      })
    } else {
      this.error.open('No Shares Available');
    }

  }

  resetData () {
    if (confirm('Are you sure you want to reset?')) {
      this.collector.reset();
    }
  }

}
