import { Component, OnInit,Output, EventEmitter } from '@angular/core';
import { CursoService } from 'src/app/servicios/curso.service';
import { Router } from '@angular/router'
import { Config } from '../../../config';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { StorageService } from 'src/app/servicios/storage.service';
import Swal from 'sweetalert2';
import { TourService, IStepOption } from 'ngx-tour-md-menu';
import { LocalService } from 'src/app/servicios/local.service';
@Component({
  selector: 'app-cursos-admin',
  templateUrl: './cursos-admin.component.html',
  styleUrls: ['./cursos-admin.component.css']
})
export class CursosAdminComponent implements OnInit {
  pageCurso: number;
  pageSizeCurso: number;
  collectionSizeCurso: number;
  cursos:any=[]
  pageCursoBase: number;
  pageSizeCursoBase: number;
  collectionSizeCursoBase: number;
  cursosBase:any=[]
  token:string
  id:string
  loading = false
  contadorLoading=0
  @Output()
  detalle_curso = new EventEmitter<any>()
  constructor(private localService: LocalService,public tourService: TourService, private _cursoService: CursoService, private _router:Router, private _storageService: StorageService, private _administradorService: AdministradorService) {
    this.pageCurso = 1;
    this.pageSizeCurso = 4;
    this.pageCursoBase = 1;
    this.pageSizeCursoBase = 4;

    this.tourService.enableHotkeys()
    this.tourService.initialize([
      {
        anchorId: 'menu.recursos',
        content: 'En esta sección podrás editar, eliminar y ver el detalle de los distitnos recursos creados por los profesores en la plataforma.',
        placement: 'rigth',
        title: 'Sección Recursos',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'recursos.tabla',
        content: 'En esta sección encontrarás el detalle de de los recursos creados por la plataforma y los recursos bases disponibles que pueden ser clonados.',
        placement: 'rigth',
        title: 'Recursos Plataforma',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'recursos.recursos',
        content: 'Para poder ver los recursos creados por los profesores debes clickear esta pestaña.',
        placement: 'rigth',
        title: 'Recursos Creados',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'recursos.recursosBase',
        content: 'Para poder ver los recursos base que pueden ser utilizados en la creación de recursos debes clickear esta pestaña.',
        placement: 'rigth',
        title: 'Recursos Bases',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        route: 'admin/asignaturas'
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
    this.getCursos();
    this.getCursosBase();
    this.tutorial();
  }

  public terminarTutorial(){
    this.tourService.end()
    this._administradorService.finalizarTutorial(this.id).subscribe((data:any)=>{
      if(data['Response']=="exito"){
        const Toast = Swal.mixin({
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

  get cursos_tabla(): any[] {
    return this.cursos
      .map((profesor, i) => ({id: i + 1, ...profesor}))
      .slice((this.pageCurso - 1) * this.pageSizeCurso, (this.pageCurso - 1) * this.pageSizeCurso + this.pageSizeCurso);
  }

  get cursos_base_tabla(): any[] {
    return this.cursosBase
      .map((cursoBase, i) => ({id: i + 1, ...cursoBase}))
      .slice((this.pageCursoBase - 1) * this.pageSizeCursoBase, (this.pageCursoBase - 1) * this.pageSizeCursoBase + this.pageSizeCursoBase);
  }

  public getCursos(){
  	this._cursoService.getCursosAdmin().subscribe((data: Array<any>) => {
      this.cursos = data;
      for(let curso of this.cursos){
        if (curso.imagen == ""){
          curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/default"
        }
        else{
          curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/"+curso.imagen
        }
      }
      if(this.contadorLoading<2){
        this.contadorLoading = this.contadorLoading +1
      }
      this.collectionSizeCurso = this.cursos.length;
    });
  }

  public getCursosBase(){
    this._cursoService.getCursosBase().subscribe((data)=>{
      this.cursosBase = data;
      for(let curso of this.cursosBase){
        if (curso.imagen == ""){
          curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/default"
        }
        else{
          curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/"+curso.imagen
        }
      }
      this.collectionSizeCursoBase = this.cursosBase.length;
      if(this.contadorLoading<2){
        this.contadorLoading = this.contadorLoading +1
      }
    })
  }
  public ver_detalle_curso(id:string){
    this.detalle_curso.emit({'vista':"detalle_curso", 'id':id})
    this._router.navigateByUrl('/admin/cursos/detalle_recurso/'+id)
  }

  previewCursoBase(id:string){
    this._router.navigateByUrl('/admin/recursos/recurso_base/'+id+'/detalle_recurso')
  }

  deleteCurso(id:string){
    Swal.fire({
      type:'question',
      title: 'Desactivar Recurso',
      text: 'Está seguro que desea cerrar el recurso?',
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true
    }).then((result)=>{
      if(result.value){
        this.loading = true
        this._cursoService.deleteCurso(id).subscribe((data)=>{
          this.loading= false
          if(data['Response']=="exito"){
            Swal.fire({
              type:'success',
              title: 'Registro exitoso',
              text: 'Se ha desactivado el recurso satifactoriamente',
              confirmButtonColor: '#2dce89',
              confirmButtonText: 'Aceptar',
            }).then((result)=>{
              this.getCursos()
            })
          }
        })
      }
    })
  }

  deleteRecurso(id:string){
    Swal.fire({
      type:'question',
      title: 'Eliminar recurso',
      text: 'Está seguro que desea borrar el recurso?',
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true
    }).then((result)=>{
        if(result.dismiss==null){
          this.loading=true
          this._cursoService.deleteRecursoPermanente(id,this.token).subscribe((data)=>{
            this.loading=false
            if(data['Response']=="exito"){
              Swal.fire({
                type:'success',
                title: 'Recurso Eliminado',
                text: 'Se ha eliminado el recurso satifactoriamente',
                confirmButtonColor: '#2dce89',
                confirmButtonText: 'Aceptar',
              }).then((result)=>{
                this.getCursos();
              })
            }
          })
        }
    })
  }

}
