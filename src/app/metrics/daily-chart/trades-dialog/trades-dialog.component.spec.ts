import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradesDialogComponent } from './trades-dialog.component';

describe('TradesDialogComponent', () => {
  let component: TradesDialogComponent;
  let fixture: ComponentFixture<TradesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
