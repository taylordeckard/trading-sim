import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChartsComponent } from './charts.component';
import { CandleChartModule } from '../candle-chart/candle-chart.module';
import { CandleChartV2Module } from '../candle-chart-v2/candle-chart-v2.module';
import { VolumeChartModule } from '../volume-chart/volume-chart.module';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MinmaxPipe } from './minmax.pipe';

@NgModule({
  declarations: [ChartsComponent, MinmaxPipe],
  exports: [ChartsComponent],
  imports: [
    CandleChartModule,
    CandleChartV2Module,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    VolumeChartModule,
  ]
})
export class ChartsModule { }
