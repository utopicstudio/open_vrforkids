import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Config } from 'src/app/config'
//SERVICIOS
import { CursoService } from 'src/app/servicios/curso.service';
import { AlumnoService } from 'src/app/servicios/alumno.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { AsignaturaService } from 'src/app/servicios/asignatura.service';
import { ProfesorService } from 'src/app/servicios/profesor.service';
import { TourService, IStepOption } from 'ngx-tour-md-menu';
import { LocalService } from 'src/app/servicios/local.service';
@Component({
  selector: 'app-cursos-activos-profesor',
  templateUrl: './cursos-activos-profesor.component.html',
  styleUrls: ['./cursos-activos-profesor.component.css']
})
export class CursosActivosProfesorComponent implements OnInit {
	cursos:any = [];
  pageCursos: number;
  pageSizeCursos: number;
  collectionSizeCursos: number;
  token:string
  id:string
  loading=false
  @Output()
	detalleCursoBase = new EventEmitter();

  constructor(
    private _cursoService: CursoService, 
    private _alumnoService: AlumnoService,
    private localService: LocalService,
    private _storageService: StorageService,
    private _asignaturaService: AsignaturaService,
    private _profesorService: ProfesorService,
    private _router: Router,
    public tourService: TourService,
  ){
    this.pageCursos = 1;
    this.pageSizeCursos = 4;
    this.tourService.enableHotkeys()
    this.tourService.initialize([
    {
      anchorId: 'menu_profesor.mis_recursos',
      content: 'Para poder conocer tantos tus recursos que se encuentran activos y otros que no debes hacer click en esta parte.',
      placement: 'auto',
      title: 'Mis Recursos',
      enableBackdrop: false,
      nextBtnTitle: 'Sig',
      prevBtnTitle	: 'Ant',
      endBtnTitle : 'Terminar',
    },
    {
      anchorId: 'recursos_activos',
      content: 'En esta sección aparecerán tus recursos que se encuentran activos. Además podrás ver el detalle de cada recurso y dar de baja un recurso.',
      placement: 'auto',
      title: 'Recursos Activos',
      enableBackdrop: false,
      nextBtnTitle: 'Sig',
      prevBtnTitle	: 'Ant',
      endBtnTitle : 'Terminar',
    },
    {
      route:'profesor/recursos_desactivados'
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
    this.cursosActivos();
    this.tutorial();
  }

  public terminarTutorial(){
    this.tourService.end()
    this._profesorService.finalizarTutorial(this.id).subscribe((data:any)=>{
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
    this._profesorService.getProfesor(this.id).subscribe((data:any)=>{
		  if(data['primera_vez']){
        this.tourService.start()
      }
  
    })
  }

  public cursosActivos():void {
    const profesor = this.id
    this.loading = true
  	this._cursoService.getCursoActivos(profesor).subscribe((data: Array<any>) => {
  		this.cursos = data;
      this.collectionSizeCursos = this.cursos.length;
      for(let curso of this.cursos){
        var contador = 0
        for(let alumno of curso.alumnos){
          if(alumno.activo){
            contador = contador+1
          }
        }
        curso.alumnos = contador
        if (curso.imagen == ""){
          curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/default"
        }
        else{
          curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/"+curso.imagen
        }      
      }
      this.loading = false
  	});
  }

  get cursos_tabla(): any[] {
    return this.cursos
      .map((profesor, i) => ({id: i + 1, ...profesor}))
      .slice((this.pageCursos - 1) * this.pageSizeCursos, (this.pageCursos- 1) * this.pageSizeCursos + this.pageSizeCursos);
  }

  public ver_detalle_curso(id:string){
    this._router.navigateByUrl('profesor/detalle_recurso/'+id)
  }

  public desactivarCurso(id:string){
    Swal.fire({
      title: 'Desea cerrar este curso?',
      text: 'Estos cambios son irreversibles',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result)=>{
      if(result.value){
        this.loading=true
        this._cursoService.desactivarCurso(id).subscribe((data:any)=>{
          this.loading=false
          if(data['Response']=='exito'){
            Swal.fire({
              title:'Cambios guardados',
              text:'Se ha desactivado el curso correctamente.',
              type:'success',
              confirmButtonColor: '#2dce89',
            }).then((result)=>{
              if(result.value || result.dismiss){
                this.cursosActivos();
              }
            })
          }
        })
      }
      if(result.dismiss){}
    })
  }

  jugarRecurso(id:string, id_curso_base:string){
    window.open(Config.API_PREVIEW_PROFESOR+"/"+id_curso_base+"/?token="+this.token+"&resource="+id, "_blank")
  }

}
