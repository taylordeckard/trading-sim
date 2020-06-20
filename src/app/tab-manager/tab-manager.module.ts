import { NgModule } from '@angular/core';
import { ChartsModule } from '../charts/charts.module';
import { CommonModule } from '@angular/common';
import { TabManagerComponent } from './tab-manager.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [TabManagerComponent],
  exports: [TabManagerComponent],
  imports: [
    ChartsModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    ReactiveFormsModule,
  ],
})
export class TabManagerModule { }
