import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CursosActivosProfesorComponent } from './cursos-activos-profesor.component';

describe('CursosActivosProfesorComponent', () => {
  let component: CursosActivosProfesorComponent;
  let fixture: ComponentFixture<CursosActivosProfesorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CursosActivosProfesorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CursosActivosProfesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
