import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CollectorService,
  GameStateService,
  YahooService,
} from '../services';
import { Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

const intervalMap = {
  '1 min': 6,
  '2 min': 12,
  '5 min': 30,
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public currentSymbol = this.gameState.state.currentSymbol;
  public candleInterval: '1 min' | '2 min' | '5 min' = '1 min';
  private destroyed$ = new Subject<void>();
  public data$ = this.collector.stream
    .pipe(
      map(frames => frames[this.currentSymbol]),
      map(frames => {
        let frameCount = 0;
        let max = intervalMap[this.candleInterval];
        const reduced = frames.reduce((memo, f) => {
          frameCount += 1;
          if (frameCount === max) {
            memo.results.push(memo.frame);
            memo.frame = undefined;
            frameCount = 0;
          }
          if (!memo.frame) {
            memo.frame = Object.assign({}, f);
          } else {
            memo.frame.high = Math.max(memo.frame.high, f.high);
            memo.frame.low = Math.min(memo.frame.low, f.low);
            memo.frame.last = f.last
            memo.frame.close = f.close
            memo.frame.volume += f.volume;
            memo.frame.lastDayVolume = f.lastDayVolume;
          }

          return memo;
        }, { frame: undefined, results: [] });
        if (reduced.frame) { reduced.results.push(reduced.frame); }
        return reduced.results;
      })
    );

  constructor(
    private collector: CollectorService,
    private gameState: GameStateService,
    private yahoo: YahooService,
  ) { }

  ngOnDestroy () {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.yahoo.connect()
      .pipe(
        map(response => {
          // console.log(response);
          if (!Array.isArray(response)) {
            this.collector.record(response);
          }
          return this.collector.frames[this.currentSymbol];
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    this.yahoo.socketOpen$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.yahoo.send(this.currentSymbol));
  }

  public changeCandleInterval () {
    this.collector.stream.next(this.collector.frames);
  }
}
