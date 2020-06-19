import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/websocket';
import { EMPTY, Observable, Subject, timer } from 'rxjs';
import { catchError, delayWhen, retryWhen, tap } from 'rxjs/operators';
import { getProtoRoot } from '../utils';

export interface PricingData {
  id: string,
  price: number,
  time: {
    low: number,
    high: number,
    unsigned: boolean,
  },
  exchange: string,
  quoteType: string,
  marketHours: string,
  changePercent: number,
  dayVolume: {
    low: number,
    high: number,
    unsigned: boolean,
  },
  change: number,
  priceHint: {
    low: number,
    high: number,
    unsigned: boolean,
  }
}

const RECONNECT_INTERVAL = 2000;
const { quotefeeder } = getProtoRoot();
function base64ToArray(base64) {
    var binaryString = atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

@Injectable({
	providedIn: 'root',
})
export class YahooService implements OnDestroy {

  public socket$: WebSocketSubject<any>;
  public socketOpen$: Subject<Event> = new Subject<Event>();
  public socketClose$: Subject<Event> = new Subject<Event>();

  constructor (
  ) { }

  public connect () {
    this.socket$ = webSocket({
      closeObserver: this.socketClose$,
      deserializer: (result) => {
        try {
          const buffer = base64ToArray(result.data);
          const decoded = quotefeeder.PricingData.decode(buffer);
          return quotefeeder.PricingData.toObject(decoded, { enums: String });
        } catch (e) {
          console.log(e);
          return {};
        }
      },
      openObserver: this.socketOpen$,
      url: 'wss://streamer.finance.yahoo.com/',
    });

    return this.socket$.pipe(this._reconnect, catchError(() => EMPTY));  
  }

  public ngOnDestroy () {
    this.socket$.complete();
  }

  public send (symbol: string) {
    this.socket$.next({ subscribe: [symbol] });
  }

  private _reconnect (observable: Observable<any>) {
    return observable.pipe(
      retryWhen(errors => errors.pipe(
          tap(val => console.log('Websocket reconnecting', val)),
          delayWhen(_ => timer(RECONNECT_INTERVAL))
        ),
      ),
    );
  }
}
