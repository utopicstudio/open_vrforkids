import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoPerfilAdministradorComponent } from './nuevo-perfil-administrador.component';

describe('NuevoPerfilAdministradorComponent', () => {
  let component: NuevoPerfilAdministradorComponent;
  let fixture: ComponentFixture<NuevoPerfilAdministradorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NuevoPerfilAdministradorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevoPerfilAdministradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
