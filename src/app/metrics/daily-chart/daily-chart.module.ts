import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { DailyChartComponent } from './daily-chart.component';
import { TradesDialogComponent } from './trades-dialog/trades-dialog.component';

@NgModule({
  declarations: [DailyChartComponent, TradesDialogComponent],
  exports: [DailyChartComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ]
})
export class DailyChartModule { }
