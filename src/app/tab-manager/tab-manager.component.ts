import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { CollectorService, GameStateService } from '../services';

@Component({
  selector: 'tab-manager',
  templateUrl: './tab-manager.component.html',
  styleUrls: ['./tab-manager.component.scss'],
})
export class TabManagerComponent implements OnInit {

  @ViewChild(MatTabGroup, { static: false }) tabGroup: MatTabGroup;
  public tabs: string[] = [];
  public symbolFC = new FormControl('', Validators.required);

  constructor(
    private cdr: ChangeDetectorRef,
    private collector: CollectorService,
    private stateSvc: GameStateService,
  ) {
    if (this.stateSvc.state.tabs) {
      this.tabs = this.stateSvc.state.tabs;
    }
  }

  ngOnInit(): void {
  }

  public addTab () {
    this.tabs = [...this.tabs, this.symbolFC.value.toUpperCase()];
    this.symbolFC.setValue('');
    if (this.tabGroup) {
      this.cdr.detectChanges();
      this.tabGroup.selectedIndex = this.tabs.length - 1;
    }
    this.stateSvc.tabs = this.tabs;
  }

  public removeTab (event: MouseEvent, symbol: string) {
    event.stopPropagation();
    this.tabs.splice(this.tabs.indexOf(symbol), 1);
    this.stateSvc.tabs = this.tabs;
  }

  public onTabChange () {
    this.collector.refresh();
  }

}
