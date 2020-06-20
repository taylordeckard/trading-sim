import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  CollectorService,
  GameStateService,
  YahooService,
} from '../services';
import { Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnDestroy, OnInit {

  @Input() symbol: string;
  public candleInterval: '1 min' | '2 min' | '5 min' = '1 min';
  private destroyed$ = new Subject<void>();
  public data$ = this.collector.stream
    .pipe(
      map(() => this.collector
        .getFramesByInterval(this.symbol, this.candleInterval)),
    );

  constructor(
    private collector: CollectorService,
    private gameState: GameStateService,
    private yahoo: YahooService,
  ) { }

  ngOnDestroy () {
    this.yahoo.unsubscribe(this.symbol);
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    if (this.yahoo.socket$) {
      this.yahoo.send(this.symbol);
    }
    this.yahoo.connect()
      .pipe(
        map(response => {
          console.log(response);
          if (!Array.isArray(response)) {
            this.collector.record(response);
          }
          return this.collector.frames[this.symbol];
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    this.yahoo.socketOpen$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.yahoo.send(this.symbol));
  }

  public changeCandleInterval () {
    this.collector.refresh();
  }
}
