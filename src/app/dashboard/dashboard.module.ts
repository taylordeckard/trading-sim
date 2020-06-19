import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ControlsModule } from '../controls/controls.module';

import { ChartModule } from '../chart/chart.module';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { VolumeChartModule } from '../volume-chart/volume-chart.module';


@NgModule({
  declarations: [DashboardComponent],
  imports: [
    ChartModule,
    CommonModule,
    ControlsModule,
    DashboardRoutingModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    VolumeChartModule,
  ]
})
export class DashboardModule { }
