import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignaturasAdminComponent } from './asignaturas-admin.component';

describe('AsignaturasAdminComponent', () => {
  let component: AsignaturasAdminComponent;
  let fixture: ComponentFixture<AsignaturasAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsignaturasAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignaturasAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
