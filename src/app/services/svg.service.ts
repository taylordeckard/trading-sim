import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { add, close, metrics, settings } from '../svgs';

const iconMap = { add, close, metrics, settings };

@Injectable({
  providedIn: 'root',
})
export class SvgService {

  constructor (
    private sanitizer: DomSanitizer,
  ) {}

  public getIcon (icon: string) {
    return this.sanitizer.bypassSecurityTrustHtml(iconMap[icon]);
  }

}
