import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/servicios/storage.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { Administrador } from 'src/app/modelos/administrador.model';
import swal from 'sweetalert2';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent implements OnInit {
  administrador:any;
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
              private _administradorService: AdministradorService)
  { 
    this.administrador = [];
  }

  ngOnInit() {
    this.builFormMiPerfil()
    this.getAdministrador()
  }

  getAdministrador(){
    this._administradorService.getAdministrador(this._storageService.getCurrentUser().id).subscribe((data:Administrador)=>{
      this.administrador = data
    })
  }

  public builFormMiPerfil(){
    this._administradorService.getAdministrador(this._storageService.getCurrentUser().id).subscribe((data:any)=>{
      this.administrador = data;
      this.formGroupPerfil = this._formBuilderMiPerfil.group({
        nombres: [this.administrador.nombres , Validators.required] ,
        apellido_paterno: [this.administrador.apellido_paterno, Validators.required],
        apellido_materno: [this.administrador.apellido_materno, Validators.required],
        email: [this.administrador.email, Validators.required],
        telefono: [this.administrador.telefono, Validators.required],
        nombre_usuario: [this.administrador.nombre_usuario, Validators.required],
        password: [this.administrador.password, Validators.required]
      })
    })
  }

  public guardarPerfil(){
    const administrador = this.formGroupPerfil.value;
    this._administradorService.putAdministrador(administrador, this.administrador.id).subscribe((data:any)=>{
      if(data['Response']=='exito'){
        swal.fire('Registro exitoso','Se ha editado su perfil correctamente!','success').then((result)=>{
          this.builFormMiPerfil(); 
          this._storageService.setCurrentSession(
            {
              'token':  this._storageService.getCurrentToken(),
              'user': {
                  'id': this.administrador.id,
                  'nombres':administrador['nombres'],
                  'apellido_paterno': administrador['apellido_paterno'],
                  'apellido_materno': administrador['apellido_materno'],
                  'nombre_usuario': administrador['nombre_usuario'], 
                  'email': administrador['email'],
                  'telefono': administrador['telefono'],
              }
            }
          )
        })
        this.builFormMiPerfil();
      }
    })
  }

}
