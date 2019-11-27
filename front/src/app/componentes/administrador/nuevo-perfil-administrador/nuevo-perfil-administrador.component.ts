import { Component, OnInit} from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';
import { AlumnoService } from '../../../servicios/alumno.service';
import { ProfesorService } from '../../../servicios/profesor.service';
import { StorageService } from '../../../servicios/storage.service';
import { ActivatedRoute, Router } from '@angular/router'
import swal from 'sweetalert2';
import { LocalService } from 'src/app/servicios/local.service';

@Component({
  selector: 'app-nuevo-perfil-administrador',
  templateUrl: './nuevo-perfil-administrador.component.html',
  styleUrls: ['./nuevo-perfil-administrador.component.css']
})
export class NuevoPerfilAdministradorComponent implements OnInit {
  titularAlerta:string ='mensaje';
  formGroupDatosPersonalesEstudiante: FormGroup;
  formGroupDatosAcademicosEstudiante: FormGroup;
  formGroupDatosPersonalesProfesor: FormGroup;
  tipo_nuevo_perfil:string;
  token:string
  id:string
  constructor(private formBuilderDatosEstudiante: FormBuilder,
              private formBuilderAcademicoEstudiante: FormBuilder,
              private formBuilderPersonalProfesor: FormBuilder,
              private _alumnoService: AlumnoService,
              private localService: LocalService,
              private _profesorService: ProfesorService,
              private _activatedRoute: ActivatedRoute,
              private _storageService: StorageService,
              private _router: Router) { }

  ngOnInit() {
    if(this._storageService.getCurrentToken()==null || this._storageService.getCurrentUser().id==null){
      this.token = this.localService.getToken()
      this.id = this.localService.getId()
    }
    else{
      this.token = this._storageService.getCurrentToken()
      this.id = this._storageService.getCurrentUser().id
    }
    this.tipo_nuevo_perfil = this._activatedRoute.snapshot.paramMap.get('tipo')
    this.buildFormPersonalEstudiante();
    this.builFormAcademicoEstudiante();
    this.buildFormPersonalProfesor();
  }

  private buildFormPersonalProfesor(){
    this.formGroupDatosPersonalesProfesor = this.formBuilderPersonalProfesor.group({
      nombres:[''],
      apellido_paterno:[''],
      apellido_materno:[''],
      email:[''],
      telefono:[''],
      nombre_usuario: [''],
      password: ['']      
    });

  }

  private buildFormPersonalEstudiante(){
    this.formGroupDatosPersonalesEstudiante = this.formBuilderDatosEstudiante.group({
      nombres:[''],
      apellido_paterno:[''],
      apellido_materno:[''],
      email:[''],
      telefono:['']
    });
  }

  private builFormAcademicoEstudiante(){
    this.formGroupDatosAcademicosEstudiante = this.formBuilderAcademicoEstudiante.group({
      nombre_usuario:[''],
      password:['1234'],
      matricula:[''],
    })
  }

  public guardarPerfilEstudiante(){
    const alumnoPersonal = this.formGroupDatosPersonalesEstudiante.value;
    const alumnoAcademico = this.formGroupDatosAcademicosEstudiante.value
    this._alumnoService.postAlumno({'data_personal':alumnoPersonal,'data_academico':alumnoAcademico}).subscribe((data:any)=>{
      if(data['Response']=='exito'){
        swal.fire('Registro exitoso','Se registrado a un alumno exitosamente','success').then((result)=>{this._router.navigateByUrl('/admin/perfiles');})
      }
    })
  }

  public guardarPerfilProfesor(){
    const profesor = this.formGroupDatosPersonalesProfesor.value;
    this._profesorService.postProfesor(profesor, this.token).subscribe((data:any)=>{
      if(data['Response']=='exito'){
        swal.fire('Registro exitoso','Se registrado a un alumno exitosamente','success').then((result)=>{this._router.navigateByUrl('/admin/perfiles');})
      }
    })
  }

  public cancelar(){
    this._router.navigateByUrl('/admin/perfiles');
  }
}
