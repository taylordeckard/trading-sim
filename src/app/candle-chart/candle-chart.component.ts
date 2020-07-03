import { AfterViewInit, Component, Input, OnDestroy  } from '@angular/core';
import { Frame } from '../types';
import { Observable, Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { genRandomId } from '../utils';
import * as d3 from 'd3';

const TRANSITION_TIME = 800;

interface ChartFrame extends Frame {
  date: Date;
}

@Component({
  selector: 'candle-chart',
  templateUrl: './candle-chart.component.html',
  styleUrls: ['./candle-chart.component.scss']
})
export class CandleChartComponent implements AfterViewInit, OnDestroy {

  public uid = genRandomId();
  @Input() prices: Observable<ChartFrame[]>;
  private chartBody;
  private destroyed$: Subject<void> = new Subject<void>();
  private frames: ChartFrame[];
  private lastPricesLength = 0;
  private candles;
  private dates;
  private t;
  private gX;
  private gY;
  private stems;
  private xBand;
  private xScale;
  private yScale;
  private xScaleZ;
  private xDateScale;
  private resizeTimer;
  private svg;
  private width = 1000;
  private height = 500;

  constructor() { }

  drawChart () {
    const margin = {top: 15, right: 0, bottom: 10, left: 50},
      w = this.width - margin.left - margin.right + 50,
      h = this.height - margin.top - margin.bottom;

    this.svg = d3.select(`#${this.uid}`)
      .attr('width', w + margin.left + margin.right)
      .attr('height', h + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' +margin.left+ ',' +margin.top+ ')');

    let xAxis = d3.axisBottom()
      .scale(this.xScale)
      .tickFormat(() => {});

    this.svg.append('rect')
      .attr('id','rect')
      .attr('width', w)
      .attr('height', h)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('clip-path', 'url(#clip)')

    this.gX = this.svg.append('g')
      .attr('class', 'axis x-axis') //Assign 'axis' class
      .attr('transform', 'translate(0,' + h + ')')
      .call(xAxis)

    this.gX.selectAll('.tick text')
      .call(this.wrap, this.xBand.bandwidth())

    let ymin = d3.min([...this.frames.map(r => r.low), ...this.frames.map(r => r.vwap)]);
    let ymax = d3.max([...this.frames.map(r => r.high), ...this.frames.map(r => r.vwap)]);
    this.yScale = d3.scaleLinear().domain([ymin, ymax]).range([h, 0]).nice();
    let yAxis = d3.axisLeft()
      .scale(this.yScale)

    this.gY = this.svg.append('g')
      .attr('class', 'axis y-axis')
      .call(yAxis);

    this.chartBody = this.svg.append('g')
      .attr('class', 'chartBody')
      .attr('clip-path', 'url(#clip)');

    this.drawMouseOverLine();

    this.svg.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', w)
      .attr('height', h)

    const extent = [[0, 0], [w, h]];

  }

  wrap (text, width) {
    text.each(function () {
      let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr('y'),
        dy = parseFloat(text.attr('dy')),
        tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text
            .append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', ++lineNumber * lineHeight + dy + 'em')
            .text(word);
        }
      }
    });
  }

  private drawCandles (selection) {
    return selection
      .attr('x', (d, i) => this.xScale(i) - this.xBand.bandwidth())
      .attr('class', 'candle')
      .attr('y', d => this.yScale(Math.max(d.open, d.close)))
      .attr('width', this.xBand.bandwidth())
      .attr('height', d => (d.open === d.close) ? 1 : this.yScale(Math.min(d.open, d.close))-this.yScale(Math.max(d.open, d.close)))
      .attr('fill', d => (d.open === d.close) ? 'silver' : (d.open > d.close) ? 'red' : 'green');
  }

  private drawStems (selection) {
    return selection
      .attr('class', 'stem')
      .attr('x1', (d, i) => this.xScale(i) - this.xBand.bandwidth()/2)
      .attr('x2', (d, i) => this.xScale(i) - this.xBand.bandwidth()/2)
      .attr('y1', d => this.yScale(d.high))
      .attr('y2', d => this.yScale(d.low))
      .attr('stroke', d => (d.open === d.close) ? 'white' : (d.open > d.close) ? 'red' : 'green');
  }

  private drawVwapLine () {
    this.chartBody.selectAll('.vwap').remove();
    this.chartBody.append('path')
      .datum(this.frames)
      .attr('class', 'vwap')
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line()
        .x((d, i) => {
          return this.xScale(i) - this.xBand.bandwidth()/2
        })
        .y((d) => {
          return this.yScale(d.vwap) || 0;
        })
      );
  }

  public setupAxis () {
    this.dates = this.frames.map(d => d.date);
    this.xScale = d3.scaleLinear().domain([-1, this.dates.length])
      .range([0, this.width])
    this.xDateScale = d3.scaleQuantize().domain([0, this.dates.length]).range(this.dates)
    this.xBand = d3
      .scaleBand()
      .domain(d3.range(-1, this.dates.length))
      .range([0, this.width])
      .padding(0.3)
  }

  ngAfterViewInit(): void {
    this.prices
      .pipe(
        delay(0),
        takeUntil(this.destroyed$),
      )
      .subscribe(prices => {
        if (prices.length > 25)  {
          this.frames = prices.slice(-25);
        } else {
          this.frames = prices;
        }
        if (this.frames?.length) {
          // console.log(this.frames[this.frames.length - 1]);
          let dateFormat = d3.timeParse('%Q');
          for (let i = 0; i < this.frames.length; i++) {
            this.frames[i].date = dateFormat(this.frames[i].timestamp);
          }

          d3.select(`#${this.uid}`).selectAll('*').remove();
          this.setupAxis();
          this.drawChart();
          this.drawData();
        }
      });
  }

  private drawMouseOverLine () {
    const mouseOverLine = () => {
      const coordinates = d3.mouse(this.svg.node());
      this.svg.selectAll('.mouse-over-line').remove();
      this.svg.append('line')
        .attr('class', 'mouse-over-line')
        .attr('x1', 0)
        .attr('x2', this.width)
        .attr('y1', coordinates[1])
        .attr('y2', coordinates[1])
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255,255,255,.4)')
        .attr('stroke-width', 1.5);
      const labelPoints = [
        { x: -50, y: coordinates[1] - 7.5 },
        { x: -50, y: coordinates[1] + 7.5 },
        { x: 0, y: coordinates[1] + 7.5 },
        { x: 5, y: coordinates[1] },
        { x: 0, y: coordinates[1] - 7.5 },
      ]
      this.svg.selectAll('.mouse-over-label').remove();
      this.svg
        .selectAll('.mouse-over-label')
        .data([labelPoints])
        .enter()
        .append('polygon')
        .attr('class', 'mouse-over-label')
        .attr('points', d => d.map(d => `${d.x},${d.y}`))
        .attr('fill', '#FFFFFF');
      this.svg.selectAll('.mouse-over-y-text').remove();
      this.svg
        .append('text')
        .attr('class', 'mouse-over-y-text')
        .attr('x', '-45')
        .attr('y', coordinates[1] + 4)
        .style('font-size', '12px')
        .text(this.yScale.invert(coordinates[1]).toFixed(2));
    }
    this.svg.on('mousemove', mouseOverLine);
    this.svg.on('mouseleave', () => {
      this.svg.selectAll('.mouse-over-label').remove();
      this.svg.selectAll('.mouse-over-line').remove();
      this.svg.selectAll('.mouse-over-y-text').remove();
    });
  }

  private drawData () {
    this.chartBody.selectAll('.candle').remove();
    this.chartBody.selectAll('.stem').remove();

    // draw rectangles
    this.candles = this.drawCandles(this.chartBody.selectAll('.candle')
      .data(this.frames, d => d.timestamp)
      .enter()
      .append('rect'));

    // draw high and low
    this.stems = this.drawStems(this.chartBody.selectAll('g.line')
      .data(this.frames, d => d.timestamp)
      .enter()
      .append('line'))
      .attr('class', 'stem');

    this.drawVwapLine();
  }

  ngOnDestroy () {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
