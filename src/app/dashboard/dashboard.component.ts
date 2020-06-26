import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CollectorService,
  GameStateService,
  YahooService,
  SvgService,
} from '../services';
import { Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public metricsIcon = this.svg.getIcon('metrics');
  public settingsIcon = this.svg.getIcon('settings');
  public get hasAccount () {
    return Boolean(this.gameState.state.account);
  }
  private destroyed$ = new Subject<void>();

  constructor(
    private gameState: GameStateService,
    private router: Router,
    private svg: SvgService,
  ) { }

  ngOnDestroy () {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    if (!this.gameState.state.account) {
      this.router.navigate(['/settings']);
    }
  }
}
