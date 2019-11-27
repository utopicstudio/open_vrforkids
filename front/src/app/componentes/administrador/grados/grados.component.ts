import { Component, OnInit } from '@angular/core';
import { GradoService } from 'src/app/servicios/grado.service';
import { ProfesorService  } from 'src/app/servicios/profesor.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { Router } from '@angular/router';
import { Profesor } from 'src/app/modelos/profesor.model';
import swal from'sweetalert2';
import { TourService, IStepOption } from 'ngx-tour-md-menu';
import { LocalService } from 'src/app/servicios/local.service';
@Component({
  selector: 'app-grados',
  templateUrl: './grados.component.html',
  styleUrls: ['./grados.component.css']
})
export class GradosComponent implements OnInit {
  pageGrado: number;
  pageSizeGrado: number;
  collectionSizeGrado: number;
  grados:any=[]
  token:string
  id:string
  loading=false
  contadorLoading=0
  constructor( private _profesroService: ProfesorService, 
    private _gradoService: GradoService,
    private _storageService: StorageService,
    private localService: LocalService,
    private _administradorService: AdministradorService,
    private _router:Router,
    public tourService: TourService
  ) {
    this.pageGrado = 1;
    this.pageSizeGrado = 4;
    this.tourService.enableHotkeys()

    this.tourService.initialize([
      {
        anchorId: 'menu.cursos',
        content: 'En esta sección podrás crear, editar y eliminar los cursos de la plataforma.',
        placement: 'rigth',
        title: 'Sección Cursos',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar'
      },
      {
        anchorId: 'cursos.tabla',
        content: 'En esta sección se listan los cursos listados en la plataforma.',
        placement: 'rigth',
        title: 'Cursos Plataforma',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar'
      },
      {
        anchorId: 'cursos.nuevo',
        content: 'Para crear un nuevo curso debes clickear el botón.',
        placement: 'rigth',
        title: 'Nuevo Curso',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar'
      },
      {
        anchorId: 'menu.cerrar_sesion',
        content: 'Para finalizar tu sesión en la plataforma debes clickear aquí.',
        placement: 'rigth',
        title: 'Cerrar Sesión',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar'
      }
    ])
  }

  ngOnInit() {
    if(this._storageService.getCurrentToken()==null || this._storageService.getCurrentUser().id==null){
      this.token = this.localService.getToken()
      this.id = this.localService.getId()
    }
    else{
      this.token = this._storageService.getCurrentToken()
      this.id = this._storageService.getCurrentUser().id
    }
    this.getGrados();
    this.tutorial();
  }


  public terminarTutorial(){
    this.tourService.end()
    this._administradorService.finalizarTutorial(this.id).subscribe((data:any)=>{
      if(data['Response']=="exito"){
        const Toast = swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
        
        Toast.fire({
          type: 'success',
          title: 'Tutorial finalizado'
        })
        this._storageService.setFalsePrimeraVez()
      }
    })
  }

  public tutorial(){
    this._administradorService.getAdministrador(this.id).subscribe((data:any)=>{
      if(data['primera_vez']){
        this.tourService.start()
      }
    })
  }


  get grados_tabla(): any[] {
    return this.grados
      .map((grado, i) => ({id: i + 1, ...grado}))
      .slice((this.pageGrado - 1) * this.pageSizeGrado, (this.pageGrado - 1) * this.pageSizeGrado + this.pageSizeGrado);
  }

  public getGrados(){
  	this._gradoService.getGradosDetalle().subscribe((data: Array<any>) => {
      this.grados = data;
      this.collectionSizeGrado = this.grados.length;
      if(this.contadorLoading<1){
        this.contadorLoading = this.contadorLoading +1
      }
    });
  }

  nuevoGrado(){
    var profesores = {}
    profesores[""] = "Seleccione al profesor para el curso"
    this._profesroService.getProfesores().subscribe((data:Profesor[])=>{
      for(let profesor of data){
        profesores[profesor.id] = profesor.nombres+" "+profesor.apellido_paterno+" "+profesor.apellido_materno
      }
    })
    swal.mixin({
      confirmButtonText: 'Siguiente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
      showCancelButton: true,
      progressSteps: ['1', '2','3']
    }).queue([
      {
        title: 'Nivel del Grado',
        text: 'Seleccione el nivel del grado',
        input: 'number',
        onOpen: function (){
          swal.disableConfirmButton();
          swal.getInput().addEventListener('keyup', function(e) {
            if((<HTMLInputElement>event.target).value == "" || parseInt((<HTMLInputElement>event.target).value)<=0) {
              swal.disableConfirmButton();
            } 
            else {
              swal.enableConfirmButton();
            }
            })
        }
      },
      {
        title: 'Identificador de Grado',
        text: 'Ingrese la letra del grado',
        input: 'text',
        onOpen: function (){
          swal.disableConfirmButton();
          swal.getInput().addEventListener('keyup', function(e) {
            if((<HTMLInputElement>event.target).value === '') {
              swal.disableConfirmButton();
            } 
            else {
              swal.enableConfirmButton();
            }
            })
        }
      },
      {
        title: 'Profesor para Curso',
        input: 'select',
        inputOptions: profesores,
        inputValidator: function (value) {
          return new Promise(function (resolve, reject) {
            if (value === "") {
              resolve('Debes seleccionar un profesor')
            } else {
              resolve()
            }
          })
        }
      }
    ]).then((result) => {
      if (result.value) {
        if(result.value[0]=="" || result.value[1]=="" || result.value[2]==""){
          swal.fire({
            type: 'error',
            title: 'Error en el registro',
            text: 'Debe completar todos los campos para registrar un grado.',
            confirmButtonColor: '#2dce89',
            confirmButtonText: 'Aceptar'
          }).then((result)=>{
            this.nuevoGrado()
          })
        }
        else{
          if(result.value[1].length>1){
            swal.fire({
              type: 'error',
              title: 'Error en el registro',
              text: 'Debe ingresar solo un caracter como identificador.',
              confirmButtonColor: '#2dce89',
              confirmButtonText: 'Aceptar'
            }).then((result)=>{
              this.nuevoGrado()
            })
          }
          else{
            this.loading = true
            this._gradoService.postGrado({'nivel':result.value[0],'identificador':result.value[1],'profesor':result.value[2]}).subscribe((data:any)=>{
              this.loading = false
              if(data['Response']=='exito'){
                  swal.fire({
                    type: 'success',
                    title: 'Registro exitoso',
                    text: 'Se ha creado el grado exitosamente',
                    confirmButtonColor: '#2dce89',
                    confirmButtonText: 'Aceptar'
                  }).then((result)=>{this.getGrados()})
              }
            },
            (error)=>{})
          }
        }
      }

    })
  }

  public eliminarGrado(id:string){
    swal.fire({
      title: 'Desea borrar este Curso?',
      text: "Usted no podrá revertir los cambios!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.loading = true
        this._gradoService.deleteGrado(id).subscribe((data:any)=>{
          this.loading = false
          if(data['Response']=='borrado'){
            swal.fire({
              title:'Borrado!',
              text:'Se ha borrado registro exitosamente.',
              type:'success',
              confirmButtonColor: '#2dce89',
            }).then((result)=>{
                this.getGrados();
            })
          }
        })
      }
      else if(result.dismiss){
      }
    })
  }

  public verAlumnos(alumnos: any, nivel:number,identificador:any): void{
    let html = '';
    html += '<table class="table table-striped">';
     html += '<thead>';
       html += '<tr>';
         html += '<th scope="col">Numero</th>';
         html += '<th scope="col">Nombre</th>';
       html += '</tr>';
     html += '</thead>';
     html += '<tbody>';
       for(var i = 0; i < alumnos.length; i++) {
          html += '<tr>';
            if(i == 0)
              html += '<th scope="row">'+(i+1).toString()+'</th>';
            else if(i == 1)
              html += '<th scope="row">'+(i+1).toString()+'</th>';
            else
              html += '<th scope="row">'+(i+1).toString()+'</th>';
            html += '<td>'+alumnos[i].nombres + " "+alumnos[i].apellido_paterno +" "+alumnos[i].apellido_materno +'</td>';
          html += '</tr>';
       }
     html += '</tbody>';
    html += '</table>';

    swal.fire({
      title: 'Alumnos Curso '+nivel.toString()+"º"+identificador,
      type: 'info',
      html: html,
      confirmButtonColor: '#2dce89',
      confirmButtonText: 'Ok'
    });
  }
}
