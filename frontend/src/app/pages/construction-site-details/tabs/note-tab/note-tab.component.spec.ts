import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteTabComponent } from './note-tab.component';

describe('NoteTabComponent', () => {
  let component: NoteTabComponent;
  let fixture: ComponentFixture<NoteTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoteTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
