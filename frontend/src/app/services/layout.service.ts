import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AvailableLayouts {
  layout: 'phone' | 'phone-landscape' | 'tablet' | 'desktop';
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  private layout: BehaviorSubject<AvailableLayouts> = new BehaviorSubject({layout: 'desktop'});
  constructor() { }

  getLayout() {
    return this.layout;
  }

  setLayout(newLayout: AvailableLayouts) {
    this.layout.next(newLayout);
  }
}
