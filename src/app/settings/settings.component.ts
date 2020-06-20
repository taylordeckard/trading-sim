import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GameStateService } from '../services';

const MIN_STARTING_BALANCE = 25000;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public setupForm = new FormGroup({
    startingBalance: new FormControl(MIN_STARTING_BALANCE, Validators.min(MIN_STARTING_BALANCE)),
  });

  constructor(
    private gameState: GameStateService,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  onStart () {
    this.gameState.init(this.setupForm.get('startingBalance').value);
    this.router.navigate(['/dashboard']);
  }

}
