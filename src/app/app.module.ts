import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import { AppConfig } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FontAwesomeModule,
    HttpClientModule,
    MatSnackBarModule,
  ],
  providers: [
	  { provide: 'ENVIRONMENT', useValue: AppConfig },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
