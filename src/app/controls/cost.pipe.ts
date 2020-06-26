import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CollectorService, GameStateService } from '../services';

@Pipe({
  name: 'cost'
})
export class CostPipe implements PipeTransform {

  private currencyPipe = new CurrencyPipe('en-US');

  constructor (
  ) { }

  transform(numShares: number, price: number): string {
    return this.currencyPipe.transform(numShares * price);
  }

}
