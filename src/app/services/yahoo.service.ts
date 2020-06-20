import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/websocket';
import { EMPTY, Observable, Subject, timer } from 'rxjs';
import { catchError, delayWhen, retryWhen, share, tap } from 'rxjs/operators';
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

  private websocket$: WebSocketSubject<any>
  public socket$: Observable<any>;
  public socketOpen$: Subject<Event> = new Subject<Event>();
  public socketClose$: Subject<Event> = new Subject<Event>();

  constructor (
  ) { }

  public connect () {
    if (!this.socket$) {
      this.websocket$ = webSocket({
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
      this.socket$ = this.websocket$
        .pipe(
          this._reconnect,
          share(),
          catchError(() => EMPTY),
        );
    }

    return this.socket$;
  }

  public ngOnDestroy () {
    this.websocket$.complete();
  }

  public send (symbol: string) {
    this.websocket$.next({ subscribe: [symbol] });
  }

  public unsubscribe (symbol: string) {
    this.websocket$.next({ unsubscribe: [symbol] });
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
