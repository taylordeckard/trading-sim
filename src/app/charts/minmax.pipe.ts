import { Pipe, PipeTransform } from '@angular/core';
import { datesAreOnSameDay } from '../utils';
import { Frame } from '../types';

@Pipe({
  name: 'minmax'
})
export class MinmaxPipe implements PipeTransform {

  transform(data: Frame[], calcType: 'max' | 'min'): number {
    const today = new Date();
    const dayFrames = data.filter(d => datesAreOnSameDay(today, new Date(Number(d.timestamp))));
    return dayFrames.reduce(
      (memo, d) => Math[calcType](memo, Math[calcType](d.high, d.low)),
      Math[calcType](data[0].high, data[0].low)
    );
  }

}
