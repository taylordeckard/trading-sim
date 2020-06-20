import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChartsComponent } from './charts.component';
import { CandleChartModule } from '../candle-chart/candle-chart.module';
import { VolumeChartModule } from '../volume-chart/volume-chart.module';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [ChartsComponent],
  exports: [ChartsComponent],
  imports: [
    CandleChartModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    VolumeChartModule,
  ]
})
export class ChartsModule { }