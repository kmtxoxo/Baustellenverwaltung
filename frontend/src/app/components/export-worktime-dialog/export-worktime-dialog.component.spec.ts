import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportWorktimeDialogComponent } from './export-worktime-dialog.component';

describe('ExportWorktimeDialogComponent', () => {
  let component: ExportWorktimeDialogComponent;
  let fixture: ComponentFixture<ExportWorktimeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportWorktimeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportWorktimeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
