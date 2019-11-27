import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilProfesorComponent } from './perfil-profesor.component';

describe('PerfilProfesorComponent', () => {
  let component: PerfilProfesorComponent;
  let fixture: ComponentFixture<PerfilProfesorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerfilProfesorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilProfesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
