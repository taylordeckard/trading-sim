import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Frame } from '../types';
import { genRandomId } from '../utils';
import { defer, Observable, Subject } from 'rxjs';
import { delay, takeUntil, tap } from 'rxjs/operators';
import * as d3 from 'd3';

interface ChartFrame extends Frame {
  date?: Date,
}

function formatTick (dates, d) {
  d = dates[d]
  if (!d) { return '-'; }
  let hours = d.getHours()
  let minutes = (d.getMinutes()<10?'0':'') + d.getMinutes()
  let amPM = hours < 13 ? 'am' : 'pm'
  return hours + ':' + minutes + amPM;
}

function shortNum (value: number) {
  if (value === null) return null;
  if (value === 0) return '0';
  var fractionSize = 1;
  var abs = Math.abs(value);
  var rounder = Math.pow(10, fractionSize);
  var isNegative = value < 0;
  var key = '';
  var powers = [
    { key: 'Q', value: Math.pow(10, 15) },
    { key: 'T', value: Math.pow(10, 12) },
    { key: 'B', value: Math.pow(10, 9) },
    { key: 'M', value: Math.pow(10, 6) },
    { key: 'k', value: 1000 },
  ];
  for (var i = 0; i < powers.length; i++) {
    var reduced = abs / powers[i].value;
    reduced = Math.round(reduced * rounder) / rounder;
    if (reduced >= 1) {
      abs = reduced;
      key = powers[i].key;
      break;
    }
  }
  return (isNegative ? '-' : '') + abs + key;
}

@Component({
  selector: 'volume-chart',
  templateUrl: './volume-chart.component.html',
  styleUrls: ['./volume-chart.component.scss']
})
export class VolumeChartComponent implements OnInit {

  public uid = genRandomId();
  @Input() prices: Observable<Frame[]>;
  private chartBody;
  private dates: Date[];
  private frames: ChartFrame[] = [];
  private xBand;
  private xScale;
  private xDateScale;
  private yScale;
  private height = 150;
  private width = 1000;
  private destroyed$: Subject<void> = new Subject<void>();
  constructor() { }

  ngOnInit(): void {
    this.prices
      .pipe(
        delay(0),
        tap(prices => {
          if (prices.length > 25)  {
            this.frames = prices.slice(-25);
          } else {
            this.frames = prices;
          }
          if (this.frames.length) {
            this.updateDataWithDates();
            d3.select(`#${this.uid}`).selectAll('*').remove();
            this.setupChart();
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe((prices: Frame[]) => {
        if (this.frames?.length) {
          this.drawBars();
        }
      });
  }

  private updateDataWithDates () {
    let dateFormat = d3.timeParse('%Q');
    this.dates = [];
    for (let i = 0; i < this.frames.length; i++) {
      this.frames[i].date = dateFormat(this.frames[i].timestamp);
      this.dates.push(this.frames[i].date);
    }
  }

  private setupChart () {
    const margin = {top: 5, right: 0, bottom: 30, left: 50},
      w = this.width - margin.left - margin.right + 50,
      h = this.height - margin.top - margin.bottom;

    let svg = d3.select(`#${this.uid}`)
      .attr('width', w + margin.left + margin.right)
      .attr('height', h + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' +margin.left+ ',' +margin.top+ ')');
    this.xScale = d3.scaleLinear().domain([-1, this.dates.length])
      .range([0, this.width]);
    this.xDateScale = d3.scaleQuantize().domain([0, this.dates.length]).range(this.dates);
    this.xBand = d3
      .scaleBand()
      .domain(d3.range(-1, this.dates.length))
      .range([0, this.width])
      .padding(0.3)
    let xAxis = d3.axisBottom()
      .scale(this.xScale)
      .tickFormat(formatTick.bind(null, this.dates));

    svg.append('rect')
      .attr('id','rect')
      .attr('width', w)
      .attr('height', h)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('clip-path', 'url(#clip)')

    const gX = svg.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', 'translate(0,' + h + ')')
      .call(xAxis)

    let ymin = 0;
    let ymax = d3.max(this.frames.map(r => r.volume));
    this.yScale = d3.scaleLinear().domain([ymin, ymax]).range([h, 0]).nice();
    let yAxis = d3.axisLeft()
      .scale(this.yScale)
      .tickFormat(d => shortNum(d));


    svg.append('g')
      .attr('class', 'axis y-axis')
      .call(yAxis);

    this.chartBody = svg.append('g')
      .attr('class', 'chartBody')
      .attr('clip-path', 'url(#clip)');
  }

  private drawBars () {
    this.chartBody.selectAll('.volume-bar')
      .data(this.frames, d => d.timestamp)
      .enter()
      .append('rect')
      .attr('meta', (d) => shortNum(d.volume))
      .attr('x', (d, i) => this.xScale(i) - this.xBand.bandwidth())
      .attr('class', 'volume-bar')
      .attr('y', d => this.yScale(d.volume))
      .attr('width', this.xBand.bandwidth())
      .attr('height', d => Math.max(this.height - this.yScale(d.volume) - 45, 0))
      .attr('fill', d => (d.open === d.close) ? 'silver' : (d.open > d.close) ? 'red' : 'green');
  }

  ngOnDestroy () {
    this.destroyed$.next();
    this.destroyed$.complete();
  }


}
