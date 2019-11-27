import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import {NgbModule, NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';
import { ReactiveFormsModule} from '@angular/forms';
import { CoreModule } from 'src/app/core.module';
// register 'es' locale
registerLocaleData(localeEs);
import { TourMatMenuModule } from 'ngx-tour-md-menu';

//COMPONENTES
import { HomeAlumnoComponent } from './home-alumno/home-alumno.component';
import { HeaderAlumnoComponent } from './header-alumno/header-alumno.component';
import { FooterAlumnoComponent } from './footer-alumno/footer-alumno.component';
import { PerfilAlumnoComponent } from './perfil-alumno/perfil-alumno.component';
import { CursosAlumnoComponent } from './cursos-alumno/cursos-alumno.component';
import { DetalleCursoAlumnoComponent } from './detalle-curso-alumno/detalle-curso-alumno.component';
import { SolicitudesAlumnoComponent } from './solicitudes-alumno/solicitudes-alumno.component';
import { NgxLoadingModule, ngxLoadingAnimationTypes } from 'ngx-loading';
const routes: Routes = [
    { path: '', component: CursosAlumnoComponent },
    { path: 'perfil', component: PerfilAlumnoComponent },
    { path: 'recursos', component: CursosAlumnoComponent },
    { path: 'recursos/detalle_recurso/:id', component: DetalleCursoAlumnoComponent },
    { path: 'solicitudes', component: SolicitudesAlumnoComponent },

];

@NgModule({
    imports: [
        ChartsModule,
        NgbModule,
        NgbPaginationModule,
        RouterModule.forChild(routes),
        CommonModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        ChartsModule,
        NgbModule,
        CoreModule,
        NgxLoadingModule.forRoot({
            animationType: ngxLoadingAnimationTypes.wanderingCubes,
            backdropBackgroundColour: 'rgba(0,0,0,0.1)', 
            backdropBorderRadius: '4px',
            primaryColour: '#ffffff', 
            secondaryColour: '#ffffff', 
            tertiaryColour: '#ffffff'
        }),
        TourMatMenuModule
    ],
    declarations: [
    HomeAlumnoComponent,
    HeaderAlumnoComponent,
    FooterAlumnoComponent,
    PerfilAlumnoComponent,
    CursosAlumnoComponent,
    DetalleCursoAlumnoComponent,
    SolicitudesAlumnoComponent],
    exports: [
        RouterModule
    ],
    providers:[
    ]
})
export class AlumnoModule { }