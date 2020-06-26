import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardModule } from './dashboard/dashboard.module';
import { MetricsModule } from './metrics/metrics.module';
import { SettingsModule } from './settings/settings.module';

const routes = [
  { path: 'dashboard', loadChildren: () => DashboardModule },
  { path: 'settings', loadChildren: () => SettingsModule },
  { path: 'metrics', loadChildren: () => MetricsModule },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot(routes),
  ],
})
export class AppRoutingModule { }
