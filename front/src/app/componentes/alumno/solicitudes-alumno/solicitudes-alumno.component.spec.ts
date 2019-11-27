import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesAlumnoComponent } from './solicitudes-alumno.component';

describe('SolicitudesAlumnoComponent', () => {
  let component: SolicitudesAlumnoComponent;
  let fixture: ComponentFixture<SolicitudesAlumnoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitudesAlumnoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudesAlumnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
