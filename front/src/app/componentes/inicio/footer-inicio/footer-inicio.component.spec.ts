import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterInicioComponent } from './footer-inicio.component';

describe('FooterInicioComponent', () => {
  let component: FooterInicioComponent;
  let fixture: ComponentFixture<FooterInicioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterInicioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
