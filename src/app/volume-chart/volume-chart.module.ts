import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolumeChartComponent } from './volume-chart.component';

@NgModule({
  declarations: [VolumeChartComponent],
  exports: [VolumeChartComponent],
  imports: [
    CommonModule
  ]
})
export class VolumeChartModule { }
