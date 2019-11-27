import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/servicios/storage.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { ProfesorService } from 'src/app/servicios/profesor.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-perfil-profesor',
  templateUrl: './perfil-profesor.component.html',
  styleUrls: ['./perfil-profesor.component.css']
})
export class PerfilProfesorComponent implements OnInit {
  profesor:any;
  formGroupPerfil:FormGroup = this._formBuilderMiPerfil.group({
    nombres: "" ,
    apellido_paterno:"",
    apellido_materno:"",
    email:"",
    telefono:"",
    nombre_usuario:"",
    password: ""
  })
  constructor(private _storageService: StorageService,
              private _router: Router,
              private _formBuilderMiPerfil: FormBuilder,
              private _profesorService: ProfesorService) { 
    this.profesor = [];
  }

  ngOnInit() {
    this.builFormMiPerfil()
  }

  public builFormMiPerfil(){
    this._profesorService.getProfesor(this._storageService.getCurrentUser().id).subscribe((data:any)=>{
      this.profesor = data;
      this.formGroupPerfil = this._formBuilderMiPerfil.group({
        nombres: [this.profesor.nombres , Validators.required] ,
        apellido_paterno: [this.profesor.apellido_paterno, Validators.required],
        apellido_materno: [this.profesor.apellido_materno, Validators.required],
        email: [this.profesor.email, Validators.required],
        telefono: [this.profesor.telefono, Validators.required],
        nombre_usuario: [this.profesor.nombre_usuario, Validators.required],
        password: [this.profesor.password, Validators.required]
      })
    })
  }

  public guardarPerfil(){
    const profesor = this.formGroupPerfil.value;
    this._profesorService.putProfesor(this.profesor.id,profesor).subscribe((data:any)=>{
      if(data['Response']=='exito'){
        swal.fire({
          title:'Registro exitoso',
          text:'Se ha editado su perfil correctamente!',
          type:'success',
          confirmButtonColor: '#2dce89',
        }).then((result)=>{
          this.builFormMiPerfil(); 
          this._storageService.setCurrentSession(
            {
              'token':  this._storageService.getCurrentToken(),
              'user': {
                  'id': this.profesor.id,
                  'nombres':profesor['nombres'],
                  'apellido_paterno': profesor['apellido_paterno'],
                  'apellido_materno': profesor['apellido_materno'],
                  'nombre_usuario': profesor['nombre_usuario'], 
                  'email': profesor['email'],
                  'telefono': profesor['telefono'],
              }
            }
          )
        })
        this.builFormMiPerfil();
      }
    })
  }

}
