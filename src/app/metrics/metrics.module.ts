import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MetricsRoutingModule } from './metrics-routing.module';
import { MetricsComponent } from './metrics.component';
import { BalanceChartModule } from './balance-chart/balance-chart.module';
import { WinLossChartModule } from './winloss-chart/winloss-chart.module';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DailyChartModule } from './daily-chart/daily-chart.module';


@NgModule({
  declarations: [MetricsComponent],
  imports: [
    BalanceChartModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule, 
    MatSelectModule,
    MetricsRoutingModule,
    WinLossChartModule,
    DailyChartModule,
  ]
})
export class MetricsModule { }
