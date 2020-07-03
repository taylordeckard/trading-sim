import { Injectable } from '@angular/core';
import * as Long from 'long';
import { interval, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CollectorService } from './collector.service';

@Injectable({
  providedIn: 'root'
})
export class MockSocketService {

  public socketOpen$ = new Subject();
  constructor(
    private collector: CollectorService, 
  ) {
    this.collector.reset('MOCK');
  }
  public connect () {
	let price = 1;
    return interval(2000)
      .pipe(map(() => {
        return {
          id: 'MOCK',
          price: price += 0.1,
          time: new Long(Date.now()),
          exchange: 'NASDAQ',
          quoteType: 'equity',
          marketHours: 'pre-market',
          changePercent: 0,
          dayVolume: new Long(100000),
          change: 0,
        };
      }));
  }

  public send (symbol: string) {
  }

  public unsubscribe () {
  }
}
