import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandleChartComponent } from './candle-chart.component';

@NgModule({
  declarations: [CandleChartComponent],
  exports: [CandleChartComponent],
  imports: [
    CommonModule
  ]
})
export class CandleChartModule { }
