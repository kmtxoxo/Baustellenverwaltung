import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstructionSiteDownloadDialogComponent } from './construction-site-download-dialog.component';

describe('ConstructionSiteDownloadDialogComponent', () => {
  let component: ConstructionSiteDownloadDialogComponent;
  let fixture: ComponentFixture<ConstructionSiteDownloadDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConstructionSiteDownloadDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstructionSiteDownloadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
