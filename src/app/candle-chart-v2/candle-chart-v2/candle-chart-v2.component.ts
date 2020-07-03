import { AfterViewInit, Component, Input, OnDestroy  } from '@angular/core';
import { Frame } from '../../types';
import { Observable, Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { genRandomId } from '../../utils';
import * as d3 from 'd3';

const TRANSITION_TIME = 800;

interface ChartFrame extends Frame {
  date: Date;
}

@Component({
  selector: 'candle-chart-v2',
  templateUrl: './candle-chart-v2.component.html',
  styleUrls: ['./candle-chart-v2.component.scss']
})
export class CandleChartV2Component implements AfterViewInit, OnDestroy {

  @Input() prices: Observable<ChartFrame[]>;
  private candles;
  private destroyed$: Subject<void> = new Subject<void>();
  private frames;
  private height = 500;
  private stems;
  private svg;
  public uid = genRandomId();
  private width = 1000;
  private xAxis;
  private yAxis;
  private xBand;
  private xScale;
  private yScale;
  private hLines = new Set();

  constructor() { }

  setupChart () {
    if (d3.select(`#${this.uid}`)?.empty()) { return; }
    const margin = {top: 15, right: 0, bottom: 10, left: 50},
      w = this.width,
      h = this.height - margin.top - margin.bottom;

    this.width = w;
    this.height = h;

    this.xScale = d3
      .scaleLinear()
      .range([0, w]);
    this.yScale = d3
      .scaleLinear()
      .range([h, 0]);

    this.svg = d3.select(`#${this.uid}`)
      .attr('width', w + margin.left + margin.right)
      .attr('height', h + margin.top + margin.bottom)
      .append('g')
      .attr('class', 'graph')
      .attr('transform', 'translate(' +margin.left+ ',' +margin.top+ ')');

    this.drawMouseOverLine();
  }

  private drawVwapLine () {
    this.svg.select('.vwap').remove();
    this.svg
      .append('path')
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

  private drawAxis () {
    this.svg.select('.x-axis').remove();
    this.svg.select('.y-axis').remove();
    let gX = this.svg
      .append('g')
      .attr('class', 'axis x-axis') //Assign 'axis' class
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(this.xAxis)
    gX.selectAll('.tick text')
      .call(this.wrap, this.xBand.bandwidth())
    let gY = this.svg
      .append('g')
      .attr('class', 'axis y-axis')
      .call(this.yAxis);
  }

  private wrap (text, width) {
    text.each(function () {
      let text = d3.select(this);
      let words = text.text().split(/\s+/).reverse();
      let word;
      let line = [];
      let lineNumber = 0;
      let lineHeight = 1.1; // ems
      let y = text.attr('y');
      let dy = parseFloat(text.attr('dy'));
      let tspan = text.text(null)
        .append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
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

  private update () {
    const dates = this.frames.map(d => d.date);
    this.xBand = d3
      .scaleBand()
      .domain(d3.range(-1, dates.length))
      .range([0, this.width])
      .padding(0.3)
    this.xScale.domain([-1, dates.length]);
    let ymin = d3.min([...this.frames.map(r => r.low), ...this.frames.map(r => r.vwap)]);
    let ymax = d3.max([...this.frames.map(r => r.high), ...this.frames.map(r => r.vwap)]);
    this.yScale.domain([ymin, ymax]).range([this.height, 0]).nice();
    this.drawData();
  }

  private hasNoChart () {
    return !this.svg || this.svg?.empty();
  }

  ngAfterViewInit(): void {
    this.prices
      .pipe(
        delay(0),
        takeUntil(this.destroyed$),
      )
      .subscribe(prices => {
        if (this.hasNoChart()) {
          this.setupChart();
          if (this.hasNoChart()) {
            return;
          }
        }
        if (prices.length > 50)  {
          this.frames = prices.slice(-50);
        } else {
          this.frames = prices;
        }
        if (this.frames?.length) {
          let dateFormat = d3.timeParse('%Q');
          for (let i = 0; i < this.frames.length; i++) {
            this.frames[i].date = dateFormat(this.frames[i].timestamp);
          }
          this.update();
        }
      });
  }

  private drawMouseOverLine () {
    const mouseG = d3.select(`#${this.uid}`)
      .append('g')
      .attr('class', 'mouse-over')
      .attr('transform', 'translate(' + 50 + ',' + 15 + ')');
    mouseG.append('svg:rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');
    const mouseOverLine = () => {
      const coordinates = d3.mouse(mouseG.node());
      mouseG.selectAll('.mouse-over-line').remove();
      mouseG.insert('line', ':first-child')
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
      mouseG.selectAll('.mouse-over-y-text').remove();
      mouseG 
        .insert('text', ':first-child')
        .attr('class', 'mouse-over-y-text')
        .attr('x', '-45')
        .attr('y', coordinates[1] + 4)
        .style('font-size', '12px')
        .text(this.yScale.invert(coordinates[1]).toFixed(2));
      mouseG.selectAll('.mouse-over-label').remove();
      mouseG 
        .selectAll('.mouse-over-label')
        .data([labelPoints])
        .enter()
        .insert('polygon', ':first-child')
        .attr('class', 'mouse-over-label')
        .attr('points', d => d.map(d => `${d.x},${d.y}`))
        .attr('fill', '#FFFFFF');
    }
    mouseG.on('mousemove', mouseOverLine);
    mouseG.on('mouseleave', () => {
      mouseG.selectAll('.mouse-over-label').remove();
      mouseG.selectAll('.mouse-over-line').remove();
      mouseG.selectAll('.mouse-over-y-text').remove();
    });
	mouseG.on('click', () => {
      const coordinates = d3.mouse(mouseG.node());
      const hLineColor = '#fffd00';
      const hLineUID = genRandomId();
      const yValue = this.yScale.invert(coordinates[1]);
      mouseG.append('line')
        .attr('class', `mouse-over-line-p ${hLineUID}`)
        .attr('x1', 0)
        .attr('x2', this.width)
        .attr('y1', coordinates[1])
        .attr('y2', coordinates[1])
        .attr('fill', 'none')
        .attr('stroke', hLineColor)
        .attr('stroke-width', 1.5);
      const labelPoints = [
        { x: -50, y: coordinates[1] - 7.5 },
        { x: -50, y: coordinates[1] + 7.5 },
        { x: 0, y: coordinates[1] + 7.5 },
        { x: 5, y: coordinates[1] },
        { x: 0, y: coordinates[1] - 7.5 },
      ];
      mouseG 
        .selectAll(`.mouse-over-label-p ${hLineUID}`)
        .exit()
        .data([labelPoints])
        .enter()
        .append('polygon')
        .attr('class', `mouse-over-label-p ${hLineUID}`)
        .attr('points', d => d.map(d => `${d.x},${d.y}`))
        .attr('fill', hLineColor);
      mouseG 
        .append('text')
        .attr('class', `mouse-over-y-text-p ${hLineUID}`)
        .attr('x', '-45')
        .attr('y', coordinates[1] + 4)
        .style('font-size', '12px')
        .text(yValue.toFixed(2));
      const hLine = mouseG.selectAll(`.mouse-over-line-p.${hLineUID},
          .mouse-over-label-p.${hLineUID},
          .mouse-over-y-text-p.${hLineUID}`)
        .style('cursor', 'pointer')
        .attr('yValue', yValue)
        .on('click', () => {
          d3.event.stopPropagation();
          mouseG.selectAll(`.mouse-over-line-p.${hLineUID},
            .mouse-over-label-p.${hLineUID},
            .mouse-over-y-text-p.${hLineUID}`)
            .remove();
          this.hLines.delete(hLine);
        });
      this.hLines.add(hLine);
	});
  }

  private drawData () {
    // draw rectangles
    this.candles = this.svg.selectAll('.candle')
      .remove()
      .exit()
      .data(this.frames, d => d.timestamp)
      .enter()
      .append('rect')
      .attr('x', (d, i) => this.xScale(i) - this.xBand.bandwidth())
      .attr('class', 'candle')
      .attr('y', d => this.yScale(Math.max(d.open, d.close)))
      .attr('width', this.xBand.bandwidth())
      .attr('height', d => (d.open === d.close) ? 1 :
        this.yScale(Math.min(d.open, d.close))-this.yScale(Math.max(d.open, d.close)))
      .attr('fill', d => (d.open === d.close) ? 'silver' :
        (d.open > d.close) ? 'red' : 'green');

    // draw high and low
    this.stems = this.svg.selectAll('.stem')
      .remove()
      .exit()
      .data(this.frames, d => d.timestamp)
      .enter()
      .append('line')
      .attr('class', 'stem')
      .attr('x1', (d, i) => this.xScale(i) - this.xBand.bandwidth()/2)
      .attr('x2', (d, i) => this.xScale(i) - this.xBand.bandwidth()/2)
      .attr('y1', d => this.yScale(d.high))
      .attr('y2', d => this.yScale(d.low))
      .attr('stroke', d => (d.open === d.close) ? 'white' : (d.open > d.close) ? 'red' : 'green');

    // update the x-axis
    this.xAxis = d3.axisBottom(this.xScale).tickFormat(() => {});
    this.svg.select('.x-axis').call(this.xAxis);

    // update the y-axis
    this.yAxis = d3.axisLeft(this.yScale);
    this.svg.select('.y-axis').call(this.yAxis);

    this.drawAxis();

    this.drawVwapLine();

    this.updateHorizontalLines();
  }

  private updateHorizontalLines () {
    this.hLines.forEach((line: any) => {
      const y = this.yScale(line.filter('line').attr('yValue'));
      line.filter('line')
        .attr('y1', y)
        .attr('y2', y);
      const labelPoints = [
        { x: -50, y: y - 7.5 },
        { x: -50, y: y + 7.5 },
        { x: 0, y: y + 7.5 },
        { x: 5, y: y },
        { x: 0, y: y - 7.5 },
      ].reduce((acc, p) => `${acc}${p.x},${p.y},`, '').replace(/,$/, '');
      line.filter('polygon')
        .attr('points', labelPoints);
      line.filter('text')
        .attr('y', y + 4);
    });
  }

  ngOnDestroy () {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
