import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/servicios/storage.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlumnoService } from 'src/app/servicios/alumno.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-perfil-alumno',
  templateUrl: './perfil-alumno.component.html',
  styleUrls: ['./perfil-alumno.component.css']
})
export class PerfilAlumnoComponent implements OnInit {
	alumno:any;
	formGroupPerfil:FormGroup = this._formBuilderPerfil.group({
		nombres: "",
		apellido_paterno: "",
		apellido_materno: "",
		matricula: "",
		email: "",
		telefono: "",
		nombre_usuario: "",
		password: ""
	});

  constructor(private _storageService: StorageService,
  						private _router: Router,
  						private _formBuilderPerfil: FormBuilder,
  						private _alumnoService: AlumnoService) {

  	this.alumno = [];
  }

  ngOnInit() {
  	this.buildFormPerfil();
  }

  public buildFormPerfil():void{
  	this._alumnoService.getAlumno(this._storageService.getCurrentUser().id).subscribe((data:any)=>{
      this.alumno = data;
      this.formGroupPerfil = this._formBuilderPerfil.group({
        nombres: [this.alumno.nombres , Validators.required] ,
        apellido_paterno: [this.alumno.apellido_paterno, Validators.required],
        apellido_materno: [this.alumno.apellido_materno, Validators.required],
        matricula: [this.alumno.matricula, Validators.required],
        email: [this.alumno.email, Validators.required],
        telefono: [this.alumno.telefono, Validators.required],
        nombre_usuario: [this.alumno.nombre_usuario, Validators.required],
        password: [this.alumno.password, Validators.required]
      });
    });
  }

  public guardarPerfil(){
    const alumno = this.formGroupPerfil.value;
    this._alumnoService.putAlumno(alumno, this.alumno.id).subscribe((data:any)=>{
      if(data['Response']=='exito'){
        swal.fire('Registro exitoso','Se ha editado su perfil correctamente!','success').then((result)=>{
          this.buildFormPerfil(); 
          this._storageService.setCurrentSession(
            {
              'token':  this._storageService.getCurrentToken(),
              'user': {
                  'id': this.alumno.id,
                  'nombres':alumno['nombres'],
                  'apellido_paterno': alumno['apellido_paterno'],
                  'apellido_materno': alumno['apellido_materno'],
                  'nombre_usuario': alumno['nombre_usuario'], 
                  'email': alumno['email'],
                  'telefono': alumno['telefono'],
              }
            }
          )
        })
        this.buildFormPerfil();
      }
    })
  }

}
