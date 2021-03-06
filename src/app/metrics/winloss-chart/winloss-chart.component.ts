import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GameStateService } from '../../services';
import { Trade, TradeType } from '../../types';
import * as d3 from 'd3';

const svgId = 'winloss-chart';

const datePipe = new DatePipe('en-US');
const formatTick = (dates: Date[], d) => {
  return datePipe.transform(d, 'MMM d');
}

interface TradeWithDate extends Trade {
  date: Date;
}

@Component({
  selector: 'winloss-chart',
  templateUrl: './winloss-chart.component.html',
  styleUrls: ['./winloss-chart.component.scss'],
})
export class WinLossChartComponent implements OnInit {

  width = 1000;
  height = 650;
  chartBody;
  dates;
  frames;
  svg;
  xAxis;
  xBand;
  // xDateScale;
  xScale;
  yAxis;
  yScale;

  constructor(
    private gameState: GameStateService,
  ) { }

  ngOnInit(): void {
    this.calcFrames();
    this.calcDates();
    this.setupChart();
    this.drawLine();
    this.drawMouseOverLine();
  }

  private setupChart () {
    const margin = {top: 5, right: 0, bottom: 30, left: 50},
      w = this.width - margin.left - margin.right + 50,
      h = this.height - margin.top - margin.bottom;

    this.svg = d3.select(`#winloss-chart`)
      .attr('width', w + margin.left + margin.right)
      .attr('height', h + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' +margin.left+ ',' +margin.top+ ')');
    this.xScale = d3.scaleTime()
      .domain(d3.extent(this.frames, function(d) { return d.date; }))
      .range([ 0, this.width ]);
    this.xBand = d3
      .scaleBand()
      .domain(d3.range(-1, this.dates.length))
      .range([0, this.width])
      .padding(0.3)
    this.xAxis = d3.axisBottom()
      .scale(this.xScale)
      .tickFormat(formatTick.bind(null, this.dates));

    this.svg.append('rect')
      .attr('id','rect')
      .attr('width', w)
      .attr('height', h)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('clip-path', 'url(#clip)')

    const gX = this.svg.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', 'translate(0,' + h + ')')
      .call(this.xAxis)

    let ymin = d3.min(this.frames.map(r => r.value));
    let ymax = d3.max(this.frames.map(r => r.value));
    this.yScale = d3.scaleLinear().domain([ymin, ymax]).range([h, 0]).nice();
    this.yAxis = d3.axisLeft()
      .scale(this.yScale);


    this.svg.append('g')
      .attr('class', 'axis y-axis')
      .call(this.yAxis);

    this.chartBody = this.svg.append('g')
      .attr('class', 'chartBody')
      .attr('clip-path', 'url(#clip)');
  }

  private calcFrames () {
    const trades: TradeWithDate[] = this.gameState.state.account.trades.map(t => {
      (<any> t).date = new Date(Number(t.timestamp));
      return <TradeWithDate> t;
    });
    const firstFrame = {
      date: new Date(trades[0].date.getTime() - 8.64e+7),
      value: 1,
    };

    this.frames = trades.reduce((memo, t) => {
      switch (t.type) {
      case TradeType.BUY:
        if (!memo.buys[t.symbol]) {
          memo.buys[t.symbol] = [];
        }
        memo.buys[t.symbol].push(t);
        break;
      case TradeType.SELL:
        // get average price of shares
        const sums = memo.buys[t.symbol].reduce((memo, b) => {
          memo.sumPrice += b.price * b.shares;
          memo.sumShares += b.shares;
          return memo;
        }, { sumPrice: 0, sumShares: 0 });
        const averagePrice = sums.sumPrice / sums.sumShares;
        const bought = averagePrice * t.shares;
        const sold = t.price * t.shares;
        // update wins/losses
        if (sold > bought) {
          memo.wins += bought - sold;
        } else if (sold < bought) {
          memo.losses += sold - bought;
        }
        // remove saved buys
        const clearedIdx = memo.buys[t.symbol].reduce((memo, buy, i) => {
          if (t.shares >= buy.shares) {
            memo.push(i);
          } else {
            buy.shares -= t.shares;
          }
          return memo;
        }, []);
        clearedIdx.forEach(i => memo.buys[t.symbol].splice(i, 1));
        
        memo.frames.push({
          date: t.date,
          value: memo.wins / (memo.wins + memo.losses),
        });
      }
      return memo;
    }, { frames: [firstFrame], buys: {}, losses: 0, wins: 0 }).frames;
  }

  private calcDates () {
    this.dates = this.frames.map(f => f.date);
  }

  private drawLine () {
    this.svg.append('path')
      .datum(this.frames)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d[d.length - 1].value > 0.5) {
          return '#00FF00';
        }
        return 'red';
      })
      .attr('stroke-width', 3)
      .attr('d', d3.line()
        .x((d) => { return this.xScale(d.date) })
        .y((d) => { return this.yScale(d.value) })
      );
  }

  private drawMouseOverLine () {
    this.svg.on('mousemove', () => {
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
        .text(`${Math.floor(this.yScale.invert(coordinates[1]) * 100)}%`);
    });
    this.svg.on('mouseleave', () => {
      this.svg.selectAll('.mouse-over-label').remove();
      this.svg.selectAll('.mouse-over-line').remove();
      this.svg.selectAll('.mouse-over-y-text').remove();
    });
  }

  private getTradeResult (trade: Trade) {
    const value = trade.price * trade.shares;
    if (trade.type === TradeType.BUY) {
      return value * -1;
    }
    return value;
  }

}
