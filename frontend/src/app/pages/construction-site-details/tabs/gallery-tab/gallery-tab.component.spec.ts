import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryTabComponent } from './gallery-tab.component';

describe('GalleryTabComponent', () => {
  let component: GalleryTabComponent;
  let fixture: ComponentFixture<GalleryTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GalleryTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
