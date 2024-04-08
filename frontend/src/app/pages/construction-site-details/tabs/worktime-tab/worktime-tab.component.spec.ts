import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorktimeTabComponent } from './worktime-tab.component';

describe('WorktimeTabComponent', () => {
  let component: WorktimeTabComponent;
  let fixture: ComponentFixture<WorktimeTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorktimeTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorktimeTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
