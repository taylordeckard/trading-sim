import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CollectorService, GameStateService } from '../services';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
})
export class ControlsComponent implements OnInit {

  public sharesFC = new FormControl(1000, Validators.required);
  public state$ = this.gameState.state$;

  constructor(
    private collector: CollectorService,
    private gameState: GameStateService,
  ) { }

  ngOnInit(): void {
  }
  
  public buy () {
    const currentPrice = this.collector.getCurrentPrice(this.gameState.state.currentSymbol);
    const debit = this.sharesFC.value * currentPrice;
    return !this.sharesFC.value
      || this.gameState.state.balance < debit;

  }

  public sell () {
    const currentPrice = this.collector.getCurrentPrice(this.gameState.state.currentSymbol);
    const credit = this.sharesFC.value * currentPrice;
    return !this.sharesFC.value
      || this.gameState.state.balance < credit;

  }

}
