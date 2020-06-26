import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsChartComponent } from './metrics-chart.component';

@NgModule({
  declarations: [MetricsChartComponent],
  exports: [MetricsChartComponent],
  imports: [
    CommonModule
  ]
})
export class MetricsChartModule { }
