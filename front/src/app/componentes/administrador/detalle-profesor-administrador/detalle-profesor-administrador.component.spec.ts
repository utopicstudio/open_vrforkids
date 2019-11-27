import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleProfesorAdministradorComponent } from './detalle-profesor-administrador.component';

describe('DetalleProfesorAdministradorComponent', () => {
  let component: DetalleProfesorAdministradorComponent;
  let fixture: ComponentFixture<DetalleProfesorAdministradorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleProfesorAdministradorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleProfesorAdministradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
