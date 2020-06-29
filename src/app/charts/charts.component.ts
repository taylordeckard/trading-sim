import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import {
  CollectorService,
  GameStateService,
  MockSocketService,
  YahooService,
} from '../services';
import { PricingData } from '../types';
import { Subject } from 'rxjs';
import { filter, map, startWith, takeUntil, tap } from 'rxjs/operators';
import { ONE, TWO, FIVE } from '@angular/cdk/keycodes';

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
      // tap(frames => console.log(this.symbol)),
    );

  @HostListener('document:keydown', ['$event'])
  onKeydown (event) {
    if (event.repeat) { return; }
    // Cmd-1 switches to 1 minute interval 
    if (event.metaKey && event.keyCode === ONE) {
      event.preventDefault();
      this.candleInterval = '1 min';
      this.changeCandleInterval();
    }
    // Cmd-2 switches to 2 minute interval
    if (event.metaKey && event.keyCode === TWO) {
      event.preventDefault();
      this.candleInterval = '2 min';
      this.changeCandleInterval();
    }
    // Cmd-5 switches to 5 minute interval
    if (event.metaKey && event.keyCode === FIVE) {
      event.preventDefault();
      this.candleInterval = '5 min';
      this.changeCandleInterval();
    }
  }

  constructor(
    private collector: CollectorService,
    private gameState: GameStateService,
    private mockSocket: MockSocketService,
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
    if (this.symbol === 'MOCK') {
      this.yahoo = <any> this.mockSocket;
    }
    this.yahoo.connect()
      .pipe(
        map((response: PricingData) => {
          if (!Array.isArray(response) && this.symbol === response.id) {
            // console.log(response);
            this.collector.record(response);
			this.gameState.setCurrentPrice(this.symbol, response.price);
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
