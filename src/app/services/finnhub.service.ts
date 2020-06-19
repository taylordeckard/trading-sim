import { Inject, Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/websocket';
import { EMPTY, Observable, Subject, timer } from 'rxjs';
import { catchError, delayWhen, retryWhen, tap } from 'rxjs/operators';

const RECONNECT_INTERVAL = 2000;

@Injectable({
	providedIn: 'root',
})
export class FinnhubService implements OnDestroy {

  public socket$: WebSocketSubject<any>;
  public socketOpen$: Subject<Event> = new Subject<Event>();
  public socketClose$: Subject<Event> = new Subject<Event>();

  constructor (
    @Inject('ENVIRONMENT') private env,
  ) { }

  public connect () {
    this.socket$ = webSocket({
      closeObserver: this.socketClose$,
      openObserver: this.socketOpen$,
      url: `wss://ws.finnhub.io?token=${this.env.token}`,

    });

    return this.socket$.pipe(this._reconnect, catchError(() => EMPTY));  
  }

  public ngOnDestroy () {
    this.socket$.complete();
  }

  public send (symbol: string, type = 'subscribe') {
    this.socket$.next({ symbol, type });
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
