import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    SettingsRoutingModule,
  ]
})
export class SettingsModule { }
