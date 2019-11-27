import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CursosDisponiblesProfesorComponent } from './cursos-disponibles-profesor.component';

describe('CursosDisponiblesProfesorComponent', () => {
  let component: CursosDisponiblesProfesorComponent;
  let fixture: ComponentFixture<CursosDisponiblesProfesorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CursosDisponiblesProfesorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CursosDisponiblesProfesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
