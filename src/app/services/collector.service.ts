import { Injectable, OnDestroy } from '@angular/core';
import { Frame, PricingData } from '../types';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const FRAMES_STORAGE_KEY = 'trader-sim__window-data';
// const ONE_MINUTE = 60000;
const TEN_SECONDS = 10000;

@Injectable({
  providedIn: 'root',
})
export class CollectorService {
  
  public frames: { [key: string]: Frame[] };
  public stream: BehaviorSubject<{[key: string]: Frame[]}>;
  private destroyed$ = new Subject<void>();

  constructor() {
    try {
      this.frames = JSON.parse(localStorage.getItem(FRAMES_STORAGE_KEY)) || {};
    } catch (e) { }
    this.stream = new BehaviorSubject(this.frames);
  }

  public ngOnDestroy () {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public record (trade: PricingData) {
    if (!trade) { return; }
    const timestamp = (new Date(trade.time.toNumber())).getTime();
    const prevFrame = this.frames[trade.id]?.[this.frames[trade.id].length - 1];
    const frameExpired = timestamp > (prevFrame?.timestamp + TEN_SECONDS);
    if (!prevFrame || frameExpired) {
      const nextFrame = {
        timestamp,
        high: trade.price,
        last: trade.price,
        lastDayVolume: trade.dayVolume?.toNumber(),
        low: trade.price,
        close: trade.price,
        open: trade.price,
        volume: this.getVolume(trade.dayVolume?.toNumber(), prevFrame),
      };
      if (!prevFrame) {
        this.frames[trade.id] = [nextFrame];
      } else {
        prevFrame.close = prevFrame.last;
        this.frames[trade.id].push(nextFrame);
      }
    } else {
      prevFrame.high = Math.max(prevFrame.high, trade.price);
      prevFrame.low = Math.min(prevFrame.low, trade.price);
      prevFrame.last = trade.price
      prevFrame.close = trade.price
      prevFrame.volume +=  this.getVolume(trade.dayVolume.toNumber(), prevFrame);
      prevFrame.lastDayVolume =  trade.dayVolume.toNumber();
    }
    localStorage.setItem(FRAMES_STORAGE_KEY, JSON.stringify(this.frames))
    this.stream.next(this.frames);
  }

  public getCurrentPrice (symbol: string) {
    return this.frames[symbol]?.[this.frames[symbol].length - 1]?.last;
  }

  private getVolume (dayVolume: number, prevFrame: Frame) {
    if (dayVolume && prevFrame?.lastDayVolume) {
      return dayVolume - prevFrame.lastDayVolume;
    }
    return 0;
  }

}
