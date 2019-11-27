import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleAlumnoAdministradorComponent } from './detalle-alumno-administrador.component';

describe('DetalleAlumnoAdministradorComponent', () => {
  let component: DetalleAlumnoAdministradorComponent;
  let fixture: ComponentFixture<DetalleAlumnoAdministradorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleAlumnoAdministradorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleAlumnoAdministradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
