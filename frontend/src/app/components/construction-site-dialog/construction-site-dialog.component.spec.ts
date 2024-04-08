import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstructionSiteDialogComponent } from './construction-site-dialog.component';

describe('ConstructionSiteDialogComponent', () => {
  let component: ConstructionSiteDialogComponent;
  let fixture: ComponentFixture<ConstructionSiteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConstructionSiteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstructionSiteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
