import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialTabComponent } from './material-tab.component';

describe('MaterialTabComponent', () => {
  let component: MaterialTabComponent;
  let fixture: ComponentFixture<MaterialTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
