import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilesAdministradorComponent } from './perfiles-administrador.component';

describe('PerfilesAdministradorComponent', () => {
  let component: PerfilesAdministradorComponent;
  let fixture: ComponentFixture<PerfilesAdministradorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerfilesAdministradorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilesAdministradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
