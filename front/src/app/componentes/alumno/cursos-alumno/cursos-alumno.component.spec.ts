import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CursosAlumnoComponent } from './cursos-alumno.component';

describe('CursosAlumnoComponent', () => {
  let component: CursosAlumnoComponent;
  let fixture: ComponentFixture<CursosAlumnoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CursosAlumnoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CursosAlumnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
