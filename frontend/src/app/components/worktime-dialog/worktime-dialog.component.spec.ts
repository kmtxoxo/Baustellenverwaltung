import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorktimeDialogComponent } from './worktime-dialog.component';

describe('WorktimeDialogComponent', () => {
  let component: WorktimeDialogComponent;
  let fixture: ComponentFixture<WorktimeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorktimeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorktimeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
