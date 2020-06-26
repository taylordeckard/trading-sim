import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ControlsModule } from '../controls/controls.module';
import { TabManagerModule } from '../tab-manager/tab-manager.module';


@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    ControlsModule,
    DashboardRoutingModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    TabManagerModule,
  ]
})
export class DashboardModule { }
