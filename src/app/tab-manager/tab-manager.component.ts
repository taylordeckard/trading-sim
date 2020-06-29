import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CLOSE_SQUARE_BRACKET, OPEN_SQUARE_BRACKET } from '@angular/cdk/keycodes';
import { FormControl, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { ENTER } from '@angular/cdk/keycodes';
import { CollectorService, GameStateService } from '../services';
import { SvgService } from '../services';

@Component({
  selector: 'tab-manager',
  templateUrl: './tab-manager.component.html',
  styleUrls: ['./tab-manager.component.scss'],
})
export class TabManagerComponent implements OnInit {

  @ViewChild(MatTabGroup, { static: false }) tabGroup: MatTabGroup;
  public addIcon = this.svgService.getIcon('add');
  public closeIcon = this.svgService.getIcon('close');
  public tabs: string[] = [];
  public symbolFC = new FormControl('', Validators.required);

  @HostListener('document:keydown', ['$event'])
  onKeydown (event) {
    if (event.repeat) { return; }
    // Cmd-Shift-{ tabs left
    if (event.shiftKey && event.metaKey && event.keyCode === OPEN_SQUARE_BRACKET) {
      event.preventDefault();
      this.tabLeft();
    }
    // Cmd-Shift-} tabs right
    if (event.shiftKey && event.metaKey && event.keyCode === CLOSE_SQUARE_BRACKET) {
      event.preventDefault();
      this.tabRight();
    }
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private collector: CollectorService,
    private gameState: GameStateService,
    private svgService: SvgService,
  ) {
    if (this.gameState.state.tabs) {
      this.tabs = this.gameState.state.tabs;
      this.gameState.currentSymbol = this.tabs[0];
      this.gameState.setCurrentPrice(
		  this.tabs[0],
		  this.collector.getCurrentPrice(this.gameState.state.currentSymbol),
	  );
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
    this.gameState.tabs = this.tabs;
    this.cdr.detectChanges();
  }

  public removeTab (event: MouseEvent, symbol: string) {
    event.stopPropagation();
    this.tabs.splice(this.tabs.indexOf(symbol), 1);
    this.gameState.tabs = this.tabs;
  }

  public onTabChange () {
    this.gameState.currentSymbol = this.tabs[this.tabGroup.selectedIndex];
    this.gameState.setCurrentPrice(
		this.gameState.state.currentSymbol,
		this.collector.getCurrentPrice(this.gameState.state.currentSymbol),
	);
    this.collector.refresh();
  }

  public tabLeft () {
    if (this.tabGroup.selectedIndex > 0) {
      this.tabGroup.selectedIndex -= 1;
    } else {
      this.tabGroup.selectedIndex = this.tabs.length - 1;
    }
  }
  public tabRight () {
    if (this.tabGroup.selectedIndex < this.tabs.length - 1) {
      this.tabGroup.selectedIndex += 1;
    } else {
      this.tabGroup.selectedIndex = 0;
    }
  }

  public onInputKeydown (event) {
    if (event.keyCode === ENTER) {
      if (this.symbolFC.valid) {
        this.addTab();
      }
    }
  }
}
