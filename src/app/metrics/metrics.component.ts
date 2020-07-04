import { Component, OnInit } from '@angular/core';
import { GameStateService, SvgService } from '../services';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss'],
})
export class MetricsComponent implements OnInit {

  public balanceChange = this.gameState.state.account.balance -
    this.gameState.state.account.startingBalance;
  public chartType: 'balance' | 'daily' | 'loss-win' = 'balance';
  public closeIcon = this.svg.getIcon('close');

  constructor(
    private gameState: GameStateService,
    private svg: SvgService,
  ) { }

  ngOnInit(): void {
  }

}
