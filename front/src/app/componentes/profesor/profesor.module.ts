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
import { CoreModule } from 'src/app/core.module'
// register 'es' locale
registerLocaleData(localeEs);
import { TourMatMenuModule } from 'ngx-tour-md-menu';

//COMPONENTES
import { CursosActivosProfesorComponent } from './cursos-activos-profesor/cursos-activos-profesor.component';
import { HeaderProfesorComponent } from './header-profesor/header-profesor.component';
import { FooterProfesorComponent } from './footer-profesor/footer-profesor.component';
import { DetalleCursoProfesorComponent } from './detalle-curso-profesor/detalle-curso-profesor.component';
import { CursosDesactivadosProfesorComponent } from './cursos-desactivados-profesor/cursos-desactivados-profesor.component'
import { CursosDisponiblesProfesorComponent } from 'src/app/componentes/profesor/cursos-disponibles-profesor/cursos-disponibles-profesor.component';
import { AlumnosProfesorComponent } from 'src/app/componentes/profesor/alumnos-profesor/alumnos-profesor.component';
import { PerfilProfesorComponent } from 'src/app/componentes/profesor/perfil-profesor/perfil-profesor.component';
import { PreviewRecursoBaseComponent } from './preview-recurso-base/preview-recurso-base.component';
import { NgxLoadingModule, ngxLoadingAnimationTypes } from 'ngx-loading';
const routes: Routes = [
    //{ path: '**', redirectTo: 'cursos_activos'},
    { path: '', component: CursosActivosProfesorComponent},
    { path: 'cursos_activos', component: CursosActivosProfesorComponent},
    { path: 'detalle_recurso/:id', component: DetalleCursoProfesorComponent},
    { path: 'recursos_desactivados' ,component: CursosDesactivadosProfesorComponent},
    { path: 'recursos_disponibles' , component: CursosDisponiblesProfesorComponent },
    { path: 'recurso_disponible/:id/detalle', component: PreviewRecursoBaseComponent},
    { path: 'alumnos' , component: AlumnosProfesorComponent },
    { path: 'mi_perfil' , component: PerfilProfesorComponent }
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
        TourMatMenuModule,
        NgxLoadingModule.forRoot({
            animationType: ngxLoadingAnimationTypes.wanderingCubes,
            backdropBackgroundColour: 'rgba(0,0,0,0.1)', 
            backdropBorderRadius: '4px',
            primaryColour: '#ffffff', 
            secondaryColour: '#ffffff', 
            tertiaryColour: '#ffffff'
        })
    ],
    declarations: [
        CursosActivosProfesorComponent,
        HeaderProfesorComponent,
        FooterProfesorComponent,
        DetalleCursoProfesorComponent,
        CursosDesactivadosProfesorComponent,
        CursosDisponiblesProfesorComponent,
        AlumnosProfesorComponent,
        PerfilProfesorComponent,
        PreviewRecursoBaseComponent
    ],
    exports: [
        RouterModule
    ],
    providers:[
    ]
})
export class ProfesorModule { }