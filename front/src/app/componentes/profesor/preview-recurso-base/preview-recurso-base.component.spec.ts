import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewRecursoBaseComponent } from './preview-recurso-base.component';

describe('PreviewRecursoBaseComponent', () => {
  let component: PreviewRecursoBaseComponent;
  let fixture: ComponentFixture<PreviewRecursoBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewRecursoBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewRecursoBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
