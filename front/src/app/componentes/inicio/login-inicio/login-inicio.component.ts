import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/servicios/login.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Session } from 'src/app/modelos/session.model';
import swal from'sweetalert2';
import Swal from 'sweetalert2';
import { LocalService } from 'src/app/servicios/local.service';

@Component({
  selector: 'app-login-inicio',
  templateUrl: './login-inicio.component.html',
  styleUrls: ['./login-inicio.component.css']
})
export class LoginInicioComponent implements OnInit {
  persona: string;
  email:string;
  password:string;
  formGroupLogin: FormGroup;
  perfil_seleccion: FormControl;
  loading:boolean = false
  constructor(private router: Router,
    private formBuilderLogin: FormBuilder,
    private localService:LocalService,
    private _loginService: LoginService,
    private _storageService: StorageService,
    private _administradorService: AdministradorService) { 
    this.persona = "Seleccione perfil";
    this.perfil_seleccion = new FormControl("");
  }

  ngOnInit() {
    this.buildFormLogin();
  }

  private buildFormLogin(){
    this.formGroupLogin = this.formBuilderLogin.group({
      email:['', Validators.required],
      password:['', Validators.required],
      tipo:this.perfil_seleccion
    });
  }

  login(){
    const dataLogin = this.formGroupLogin.value;
    if(dataLogin['tipo'] == ""){
      swal.fire({
        title : 'Error Login',
        text: 'Debe seleccionar un tipo de usuario para iniciar sesión',
        type: 'error'
      })
    }
    else{
      this.loading = true;
      this._loginService.login(dataLogin).subscribe((data:any)=>{
        if( data['respuesta'] == 'no_existe'){
          this.loading = false
          swal.fire({
            title : 'Error Login',
            text: 'Usuario no existe',
            type: 'error'
          })
        }
        else{

          this.correctLogin({token:data['token'],
                             user: {id:data['respuesta'].id,
                                    tipo: data['tipo']
                                   }
                            },
                            data['tipo'])
          this.loading = false
        }
      },
      (error) =>{
        this.loading = false
        swal.fire({
          title : 'Error Login',
          text: 'Verifique sus credenciales',
          type: 'error'
        })
      }
      )
    }
    this.loading=false
  }

  private correctLogin(data: Session, tipo:string){

    this._storageService.setCurrentSession(data);
    this.localService.setToken(this._storageService.getCurrentToken())
    this.localService.setId(this._storageService.getCurrentUser().id)
    if(tipo == 'ADMINISTRADOR'){
      this.router.navigate(['/admin']);
    }
    if(tipo == 'PROFESOR'){
      this.router.navigate(['/profesor/recursos_disponibles']);
    }
    if(tipo == 'ALUMNO'){
      this.router.navigate(['/alumno/recursos']); 
    }
  }

  cambiarPersona(tipo:string){
    this.persona = tipo;
    this.perfil_seleccion.setValue(tipo);
  }
  validateTipo(control: AbstractControl) {
    let error = true;
    var tipo = control.value
    if(tipo ==""){
      error = false
    }
    return error;
  }

}
