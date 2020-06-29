import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceChartComponent } from './balance-chart.component';

@NgModule({
  declarations: [BalanceChartComponent],
  exports: [BalanceChartComponent],
  imports: [
    CommonModule
  ]
})
export class BalanceChartModule { }
