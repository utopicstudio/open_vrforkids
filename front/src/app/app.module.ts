import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule} from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { RoutesModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChartsModule } from 'ng2-charts';
import { ReactiveFormsModule} from '@angular/forms';
import { CoreModule } from 'src/app/core.module';
import { AdministradorModule } from 'src/app/componentes/administrador/administrador.module';
import { ProfesorModule } from 'src/app/componentes/profesor/profesor.module';
import { AlumnoModule } from 'src/app/componentes/alumno/alumno.module';
import { LocalService } from './servicios/local.service';
import { TourNgBootstrapModule } from 'ngx-tour-ng-bootstrap';


// register 'es' locale
registerLocaleData(localeEs);


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    BrowserModule,
    HttpClientModule,
    HttpModule,
    RoutesModule,
    ReactiveFormsModule,
    ChartsModule,
    NgbModule,
    CoreModule,
    AdministradorModule,
    ProfesorModule,
    AlumnoModule,
    TourNgBootstrapModule.forRoot(),
  ],
  providers: [LocalService],
  entryComponents: [ ],
  bootstrap: [ AppComponent],
})
export class AppModule {
  constructor() { 
   } 
}