import { Injectable } from '@angular/core';
import * as Long from 'long';
import { interval, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MockSocketService {

  public socketOpen$ = new Subject();
  constructor() { }
  public connect () {
    return interval(500)
      .pipe(map(() => {
        return {
          id: 'MOCK',
          price: Math.random() * (4 - 3) + 3,
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
}
