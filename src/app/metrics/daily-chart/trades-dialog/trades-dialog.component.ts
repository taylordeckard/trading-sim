import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameStateService } from '../../../services';
import { TradeType } from '../../../types';

interface RowData {
  date: Date,
  change: number;
}

@Component({
  selector: 'app-trades-dialog',
  templateUrl: './trades-dialog.component.html',
  styleUrls: ['./trades-dialog.component.scss']
})
export class TradesDialogComponent implements OnInit {

  public tableData: RowData[];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { date: Date },
    private gameState: GameStateService,
  ) { }

  ngOnInit(): void {
    this.buildData();
  }

  private buildData () {
    const tradesForDay = this.gameState.state.account.trades
      .filter(t => {
        const d = new Date(Number(t.timestamp));
        return d.getDate() === this.data.date.getDate()
          && d.getMonth() === this.data.date.getMonth()
          && d.getFullYear() === this.data.date.getFullYear();
      });
    this.tableData = tradesForDay
      .reduce((acc, t) => {
        if (t.type === TradeType.SELL && acc.buys[t.symbol]) {
          const gross = t.price * t.shares;
          const sums = acc.buys[t.symbol].reduce((acc, t) => {
            acc.totalCost += t.price * t.shares;
            acc.totalShares += t.shares;
            return acc;
          }, { totalCost: 0, totalShares: 0 });
          const avgCost = sums.totalCost / sums.totalShares;
          if (!acc.sold[t.symbol]) { acc.sold[t.symbol] = 0; }
          acc.sold[t.symbol] += t.shares;
          if (acc.sold[t.symbol] === sums.totalShares) {
            delete acc.buys[t.symbol];
            delete acc.sold[t.symbol];
          }
          acc.result.push({
            date: new Date(Number(t.timestamp)),
            change: gross - (avgCost * t.shares),
          });
        } else {
          // store buys to compute average cost
          acc.buys[t.symbol] = [...(acc.buys[t.symbol] || []), t];
        }
        return acc;
      }, { buys: {}, result: [], sold: {} }).result;
  }
}
