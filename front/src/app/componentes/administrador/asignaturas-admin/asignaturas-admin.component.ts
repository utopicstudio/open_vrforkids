import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from 'src/app/servicios/asignatura.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { Router } from '@angular/router';
import swal from'sweetalert2';
import { TourService, IStepOption } from 'ngx-tour-md-menu';
import { LocalService } from 'src/app/servicios/local.service';


@Component({
  selector: 'app-asignaturas-admin',
  templateUrl: './asignaturas-admin.component.html',
  styleUrls: ['./asignaturas-admin.component.css']
})
export class AsignaturasAdminComponent implements OnInit {
  pageAsignatura: number;
  pageSizeAsignatura: number;
  collectionSizeAsignatura: number;
  asignaturas:any=[]
  token:string
  id:string
  loading = false
  contadorLoading = 0
  constructor(private _asignaturaService: AsignaturaService,
    private localService: LocalService,
    private _storageService: StorageService,
    private _administradorService: AdministradorService,
    private _router:Router,
    public tourService: TourService
    ) {
    this.pageAsignatura = 1;
    this.pageSizeAsignatura = 4;
    this.tourService.enableHotkeys()
    this.tourService.initialize([
      {
        anchorId: 'menu.asignaturas',
        content: 'En esta sección podrás crear, editar y eliminar las asignaturas a las que se asocian los recursos de la plataforma.',
        placement: 'rigth',
        title: 'Sección Asignaturas',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'asignaturas.tabla',
        content: 'En esta sección se listan todas las asignaturas registradas en la plataforma, así también desde aquí puedes editar y eliminar una asignatura.',
        placement: 'rigth',
        title: 'Asignaturas Plataforma',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'asignaturas.crear',
        content: 'Para crear una asignatura debes clickear este botón y completar todos los campos que se presentan.',
        placement: 'rigth',
        title: 'Nueva Asignatura',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        route: "admin/cursos"
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
    this.getAsignaturas();
    this.tutorial()
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

  get asignaturas_tabla(): any[] {
    return this.asignaturas
      .map((asignatura, i) => ({id: i + 1, ...asignatura}))
      .slice((this.pageAsignatura - 1) * this.pageSizeAsignatura, (this.pageAsignatura - 1) * this.pageSizeAsignatura + this.pageSizeAsignatura);
  }

  public getAsignaturas(){
  	this._asignaturaService.getAsignaturasDetalle().subscribe((data: Array<any>) => {
      this.asignaturas = data;
      this.collectionSizeAsignatura = this.asignaturas.length;
      if(this.contadorLoading<1){
        this.contadorLoading = this.contadorLoading + 1
      }
    });
  }

  public editarAsignatura(id:string){
    swal.fire({
      input: 'text',
      title: 'Editar',
      text: 'Ingrese el nuevo nombre de la asignatura',
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
      showCancelButton: true,
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
    }).then((result)=>{
      if(result.value==""){
        swal.fire({
          title: 'Error',
          type: 'error',
          text : 'Debe ingresar un nombre para completar',
          confirmButtonColor: '#2dce89',
        }).then((result)=>{
          if(result){
            this.editarAsignatura(id);
          }
        })
      }
      else if(result.dismiss){
      }
      else{
        this.loading = true
        this._asignaturaService.putAsignatura({'nombre':result.value},id).subscribe((data:any)=>{
          this.loading = false
          if(data['Response']=='exito'){
            swal.fire({
              title: 'Registro exitoso',
              text: 'Se ha editado la asignatura exitosamente!',
              type: 'success',
              confirmButtonColor: '#2dce89',
              confirmButtonText: 'Aceptar'
            }).then((result)=>{
            if(result){
                this.getAsignaturas()
            }
            })
          } 
        })
     
      }
    })
  }

  public generarNuevaAsignatura(){
    swal.fire({
      input: 'text',
      title: 'Nueva Asignatura',
      text: 'Ingrese el nombre de la nueva asignatura',
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
      showCancelButton: true,
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
    }).then((result) => {
      if (result.value=="") {
        swal.fire({
          title: 'Error',
          type: 'error',
          text : 'Debe ingresar un nombre para completar',
          confirmButtonColor: '#2dce89',
        }).then((result)=>{
          if(result){
            this.generarNuevaAsignatura();
          }
        })
      }
      else if(result.dismiss){
      }
      else{
        this.loading = true
        this._asignaturaService.postAsignatura({'nombre': result.value }).subscribe((data:any)=>{
          this.loading = false
          if(data['Response']=='exito'){
            swal.fire({
              title: 'Registro exitoso',
              text: 'Se ha registrado una asignatura exitosamente!',
              type: 'success',
              confirmButtonColor: '#2dce89',
              confirmButtonText: 'Aceptar'
            }).then((result)=>{
            if(result){
                this.getAsignaturas()
            }
            })
          }
        })
      }
    })
  }

  public eliminarAsignatura(id:string){
    swal.fire({
      title: 'Desea borrar esta Asignatura?',
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
        this._asignaturaService.deleteAsignatura(id).subscribe((data:any)=>{
          this.loading = false
          if(data['Response']=='borrado'){
            swal.fire({
              title:'Borrado!',
              text:'Se ha borrado registro exitosamente.',
              type:'success',
              confirmButtonColor: '#2dce89',
              confirmButtonText: 'Aceptar'
            }).then((result)=>{
              this.getAsignaturas();
            })
          }
        })
      }
      else if(result.dismiss){
      }
    })
  }
}
  
  

