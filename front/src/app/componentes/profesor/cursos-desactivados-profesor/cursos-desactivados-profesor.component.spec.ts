import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CursosDesactivadosProfesorComponent } from './cursos-desactivados-profesor.component';

describe('CursosDesactivadosProfesorComponent', () => {
  let component: CursosDesactivadosProfesorComponent;
  let fixture: ComponentFixture<CursosDesactivadosProfesorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CursosDesactivadosProfesorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CursosDesactivadosProfesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
