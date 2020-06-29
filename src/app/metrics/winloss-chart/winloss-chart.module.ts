import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WinLossChartComponent } from './winloss-chart.component';

@NgModule({
  declarations: [WinLossChartComponent],
  exports: [WinLossChartComponent],
  imports: [
    CommonModule,
  ]
})
export class WinLossChartModule { }
