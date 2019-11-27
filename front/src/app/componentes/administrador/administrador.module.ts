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

//COMPONENTES
import { HomeAdministradorComponent } from './home-administrador/home-administrador.component';
import { HeaderAdminComponent } from './header-admin/header-admin.component';
import { FooterAdminComponent } from './footer-admin/footer-admin.component';
import { PerfilesAdministradorComponent } from './perfiles-administrador/perfiles-administrador.component';
import { NuevoPerfilAdministradorComponent } from './nuevo-perfil-administrador/nuevo-perfil-administrador.component';
import { DetalleAlumnoAdministradorComponent } from './detalle-alumno-administrador/detalle-alumno-administrador.component';
import { DetalleProfesorAdministradorComponent } from './detalle-profesor-administrador/detalle-profesor-administrador.component';
import { CursosAdminComponent } from './cursos-admin/cursos-admin.component';
import { DetalleCursoAdministradorComponent } from './detalle-curso-administrador/detalle-curso-administrador.component';
import { AsignaturasAdminComponent } from './asignaturas-admin/asignaturas-admin.component';
import { MiPerfilComponent } from './mi-perfil/mi-perfil.component';
import { GradosComponent } from './grados/grados.component';
import { DetalleGradoAdministradorComponent } from './detalle-grado-administrador/detalle-grado-administrador.component';


import { TourMatMenuModule } from 'ngx-tour-md-menu';
import { PreviewRecursoBaseComponent } from './preview-recurso-base/preview-recurso-base.component';
import { NgxLoadingModule, ngxLoadingAnimationTypes } from 'ngx-loading';
const routes: Routes = [
    { path: '', component: HomeAdministradorComponent },
    { path: 'perfiles', component: PerfilesAdministradorComponent },
    { path: 'perfiles/nuevo_perfil/:tipo', component: NuevoPerfilAdministradorComponent },
    { path: 'perfiles/detalle_alumno/:id', component: DetalleAlumnoAdministradorComponent },
    { path: 'perfiles/detalle_profesor/:id', component: DetalleProfesorAdministradorComponent },
    { path: 'recursos', component:CursosAdminComponent},
    { path: 'recursos/recurso_base/:id/detalle_recurso', component: PreviewRecursoBaseComponent},
    { path: 'cursos/detalle_recurso/:id' , component: DetalleCursoAdministradorComponent},
    { path: 'asignaturas' , component: AsignaturasAdminComponent},
    { path: 'perfil' , component: MiPerfilComponent},
    { path: 'cursos' , component: GradosComponent},
    { path: 'grados/detalle_grado/:id', component: DetalleGradoAdministradorComponent },
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
        TourMatMenuModule.forRoot(),
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
        HomeAdministradorComponent,
        HeaderAdminComponent,
        FooterAdminComponent,
        PerfilesAdministradorComponent,
        NuevoPerfilAdministradorComponent,
        DetalleAlumnoAdministradorComponent,
        DetalleProfesorAdministradorComponent,
        CursosAdminComponent,
        DetalleCursoAdministradorComponent,
        AsignaturasAdminComponent,
        MiPerfilComponent,
        GradosComponent,
        DetalleGradoAdministradorComponent,
        PreviewRecursoBaseComponent
    ],
    exports: [
        RouterModule
    ],
    providers:[
    ]
})
export class AdministradorModule { }