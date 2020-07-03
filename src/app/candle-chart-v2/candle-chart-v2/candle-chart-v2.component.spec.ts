import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CandleChartV2Component } from './candle-chart-v2.component';

describe('CandleChartV2Component', () => {
  let component: CandleChartV2Component;
  let fixture: ComponentFixture<CandleChartV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CandleChartV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CandleChartV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
