import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GameStateService, SvgService, } from '../services';

const MIN_STARTING_BALANCE = 25000;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public account = this.gameState.state.account;
  public setupForm = new FormGroup({
    startingBalance: new FormControl(MIN_STARTING_BALANCE, Validators.min(MIN_STARTING_BALANCE)),
  });
  public closeIcon = this.svg.getIcon('close');

  constructor(
    private gameState: GameStateService,
    private router: Router,
    private svg: SvgService,
  ) { }

  ngOnInit(): void {
  }

  onStart () {
    this.gameState.init(this.setupForm.get('startingBalance').value);
    this.router.navigate(['/dashboard']);
  }

  resetAccount () {
    if (confirm('This will erase the current account. Are you sure?')) {
      this.gameState.reset();
      this.account = this.gameState.state.account;
    }
  }

}
