import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCursoAdministradorComponent } from './detalle-curso-administrador.component';

describe('DetalleCursoAdministradorComponent', () => {
  let component: DetalleCursoAdministradorComponent;
  let fixture: ComponentFixture<DetalleCursoAdministradorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleCursoAdministradorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleCursoAdministradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
