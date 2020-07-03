import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandleChartV2Component } from './candle-chart-v2/candle-chart-v2.component';



@NgModule({
  declarations: [CandleChartV2Component],
  exports: [CandleChartV2Component],
  imports: [
    CommonModule
  ]
})
export class CandleChartV2Module { }
