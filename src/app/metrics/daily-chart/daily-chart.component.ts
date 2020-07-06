import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TradesDialogComponent } from './trades-dialog/trades-dialog.component';
import { GameStateService, SvgService } from '../../services';
import { TradeType } from '../../types';
import * as d3 from 'd3';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const allDays = ['Sunday', ...weekdays, 'Saturday'];
const rows = [0, 1, 2, 3, 4, 5];
const currencyPipe = new CurrencyPipe('en-US');
const datePipe = new DatePipe('en-US');

interface CellData {
  change: number;
  date: Date;
  weekday: string;
}

@Component({
  selector: 'daily-chart',
  templateUrl: './daily-chart.component.html',
  styleUrls: ['./daily-chart.component.scss'],
})
export class DailyChartComponent implements AfterViewInit {

  private data: CellData[];
  private svgId = 'daily-chart';
  private svg: d3.Selection;
  private xAxis;
  private yAxis;
  private xScale;
  private yScale;
  private width = 1000;
  private height = 650;
  private badColorRange;
  private goodColorRange;
  private targetMonth;
  public targetYear;
  public backIcon = this.svgSvc.getIcon('backward');
  public forwardIcon = this.svgSvc.getIcon('forward');
  public get month () {
    return [
      'January', 'February', 'March',
      'April', 'May', 'June',
      'July', 'August', 'September',
      'October', 'November', 'December',
    ][this.targetMonth];
  }
  public monthsBack = 0;
  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private gameState: GameStateService,
    private svgSvc: SvgService,
  ) { }

  ngAfterViewInit(): void {
    this.setupChart();
    this.data = this.getData();
    this.drawSquares();
    this.drawLabels();
  }

  private setupChart() {
    const margin = {top: 5, right: 0, bottom: 30, left: 50},
      w = this.width - margin.left - margin.right + 50,
      h = this.height - margin.top - margin.bottom;
    this.svg = d3.select(`#${this.svgId}`)
      .attr('width', w + margin.left + margin.right)
      .attr('height', h + margin.top + margin.bottom)
    this.svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    this.xScale = d3.scaleBand()
      .range([0, w])
      .domain(weekdays)
      .padding(0.01);
    this.svg.append("g")
      .attr("transform", "translate(0," + h + ")")
      .call(d3.axisBottom(this.xScale))
    
    this.yScale = d3.scaleBand()
      .range([h, 0])
      .domain(rows)
      .padding(0.01);
    this.svg.append('g')
      .call(d3.axisLeft(this.yScale));
  }

  private drawSquares () {
    this.badColorRange = d3.scaleLinear()
      .range(['red', 'white'])
      .domain([d3.min(this.data.map(d => d.change)),0])
    this.goodColorRange = d3.scaleLinear()
      .range(['white', '#00FF00'])
      .domain([0, d3.max(this.data.map(d => d.change))])
    this.svg.selectAll('.cell')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', (d) => this.xScale(d.weekday))
      .attr('y', (d, i, nodes) => {
        const arr = d3.selectAll(nodes).data();
        const startIdx = arr[0].date.getDay() - 1;
        const idx = i + startIdx;
        const rowIdx = Math.floor(idx / 5);
        const convertedIdx = rowIdx + (rowIdx + (5 - rowIdx) - (2 * rowIdx));
        const row = Math.floor(convertedIdx);
        return this.yScale(row)
      })
      .attr('width', this.xScale.bandwidth() )
      .attr('height', this.yScale.bandwidth() )
      .style('fill', (d) => {
        if (d.change > 0) {
          return this.goodColorRange(d.change);
        } else if (d.change < 0) {
          return this.badColorRange(d.change);
        } else {
          return 'white';
        }
      })
      .style('cursor', 'pointer')
      .on('click', d => {
        this.openTradeDialog(d.date);
      });
  }

  private drawLabels () {
    const labels = this.svg.selectAll('.label')
      .data(this.data)
      .enter()
      .append('g')
      .attr('class', 'label');
    labels
      .append('text')
      .style('font-weight', 'bold')
      .attr('x', (d) => this.xScale(d.weekday) + (this.xScale.bandwidth() / 2))
      .attr('y', this.findY.bind(this))
      .attr('dy', '-1em')
      .style('text-anchor', 'middle')
      .text(d => d.date.getDate());
    labels
      .append('text')
      .attr('x', (d) => this.xScale(d.weekday) + (this.xScale.bandwidth() / 2))
      .attr('y', this.findY.bind(this))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(d => `${currencyPipe.transform(d.change)}`);
  }

  private getData () {
    const trades = this.gameState.state.account.trades;
    const dayData: CellData[] = this.getDaysOfMonthArray(this.monthsBack);
    const today = new Date();

    trades.forEach(t => {
      const date = new Date(Number(t.timestamp));
      const chgAmt = t.price * t.shares;
      const change = t.type === TradeType.SELL ? chgAmt : (chgAmt * -1);
      if (
        date.getMonth() === this.targetMonth
        && date.getFullYear () === this.targetYear
      ) {
        const dayDataCell = dayData[date.getDate() - 1];
        dayDataCell.change += change;
      }
    });

    return dayData
      .filter(d => d.weekday !== 'Saturday' && d.weekday !== 'Sunday');
  }

  private getDaysOfMonthArray (monthsBack = 0) {
    this.setTargetDate();
    const targetDate = new Date(this.targetYear, this.targetMonth + 1, 0);
    return new Array(targetDate.getDate())
      .fill({})
      .map((_, i) => {
        const date = new Date(this.targetYear, this.targetMonth, i + 1);
        return {
          change: 0,
          date,
          weekday: allDays[date.getDay()],
        };
      });
  }

  private findY (d, i , nodes) {
    const arr = d3.selectAll(nodes).data();
    const startIdx = arr[0].date.getDay() - 1;
    const idx = i + startIdx;
    const rowIdx = Math.floor(idx / 5);
    const convertedIdx = rowIdx + (rowIdx + (rows.length - 1 - rowIdx) - (2 * rowIdx));
    const row = Math.floor(convertedIdx);
    return this.yScale(row) + (this.yScale.bandwidth() / 2);
  }

  private setTargetDate () {
    const today = new Date();
    this.targetMonth = today.getMonth() - this.monthsBack;
    this.targetYear = today.getFullYear();
    while (this.targetMonth < 0) {
      this.targetMonth = 12 + this.targetMonth;
      this.targetYear = this.targetYear - 1;
    }
    this.cdr.detectChanges();
  }

  public changeMonth(dir: 'back' | 'forward') {
    if (dir === 'back') {
      this.monthsBack += 1;
    } else {
      this.monthsBack -= 1;
    }
    this.svg.selectAll('*').remove();
    this.ngAfterViewInit();
  }

  public openTradeDialog (date: Date) {
    const dialogRef = this.dialog.open(TradesDialogComponent, {
      width: '500px',
      data: { date },
    });
  }
}
