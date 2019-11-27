import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleGradoAdministradorComponent } from './detalle-grado-administrador.component';

describe('DetalleGradoAdministradorComponent', () => {
  let component: DetalleGradoAdministradorComponent;
  let fixture: ComponentFixture<DetalleGradoAdministradorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleGradoAdministradorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleGradoAdministradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
