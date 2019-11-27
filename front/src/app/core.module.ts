import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AuthorizatedGuard, AuthorizatedGuardProfesor, AuthorizatedGuardAlumno } from 'src/app/authorizated.guard';
//SERVICIOS
import { LoginService } from 'src/app/servicios/login.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { ProfesorService } from 'src/app/servicios/profesor.service';
import { AsignaturaService } from 'src/app/servicios/asignatura.service';
import { AlumnoService } from 'src/app/servicios/alumno.service';
import { CursoService } from 'src/app/servicios/curso.service';
import { GradoService } from 'src/app/servicios/grado.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { InscripcionService } from 'src/app/servicios/inscripcion.service';

@NgModule({
    imports: [HttpClientModule],
    providers:[
        LoginService, 
        StorageService, 
        AuthorizatedGuard,
        AuthorizatedGuardProfesor,
        AuthorizatedGuardAlumno,
        ProfesorService,
        AsignaturaService,
        AlumnoService,
        CursoService,
        GradoService,
        AdministradorService,
        InscripcionService
    ]
})
export class CoreModule { }