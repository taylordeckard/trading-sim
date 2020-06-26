import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MetricsRoutingModule } from './metrics-routing.module';
import { MetricsComponent } from './metrics.component';
import { MetricsChartModule } from './metrics-chart/metrics-chart.module';

import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [MetricsComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MetricsRoutingModule,
    MetricsChartModule
  ]
})
export class MetricsModule { }
