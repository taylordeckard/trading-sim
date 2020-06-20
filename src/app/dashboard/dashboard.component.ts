import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CollectorService,
  GameStateService,
  YahooService,
} from '../services';
import { Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  private destroyed$ = new Subject<void>();

  constructor(
    private gameState: GameStateService,
    private router: Router,
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
