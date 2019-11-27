import { Component, OnInit } from '@angular/core';
import { CursoService } from 'src/app/servicios/curso.service';
import { AlumnoService } from 'src/app/servicios/alumno.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { AsignaturaService } from 'src/app/servicios/asignatura.service';
import { ProfesorService} from 'src/app/servicios/profesor.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Config } from 'src/app/config'
import { TourService, IStepOption } from 'ngx-tour-md-menu';
import { LocalService } from 'src/app/servicios/local.service';
@Component({
  selector: 'app-cursos-desactivados-profesor',
  templateUrl: './cursos-desactivados-profesor.component.html',
  styleUrls: ['./cursos-desactivados-profesor.component.css']
})
export class CursosDesactivadosProfesorComponent implements OnInit {
	cursos:any = [];
  pageCursos: number;
  pageSizeCursos: number;
  collectionSizeCursos: number;
  token:string
  id:string
  loading=false
  constructor(
    private _cursoService: CursoService, 
    private _alumnoService: AlumnoService,
    private _storageService: StorageService,
    private _asignaturaService: AsignaturaService,
    private _router: Router,
    private localService: LocalService,
    public tourService: TourService,
    private _profesorService: ProfesorService
  ){
    this.pageCursos = 1;
    this.pageSizeCursos = 4;
    this.tourService.enableHotkeys()
    this.tourService.initialize([
    {
      anchorId: 'recursos_finalizados',
      content: 'En esta sección aparecerán tus recursos que se encuentran finalizados. Además podrás ver el detalle de que resume a cada recurso.',
      placement: 'auto',
      title: 'Recursos Activos',
      enableBackdrop: false,
      nextBtnTitle: 'Sig',
      prevBtnTitle	: 'Ant',
      endBtnTitle : 'Terminar',
    },
    {
      route:'profesor/alumnos'
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
    this.cursosDesactivados();
    this.tutorial();
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
                title: 'Registro exitoso',
                text: 'Se ha desactivado el curso satifactoriamente',
                confirmButtonColor: '#2dce89',
                confirmButtonText: 'Aceptar',
              }).then((result)=>{
                this.cursosDesactivados();
              })
            }
          })
        }
    })
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

  public cursosDesactivados():void {
    const profesor = this.id
    this.loading=true
  	this._cursoService.getCursoDesactivados(profesor).subscribe((data: Array<any>) => {
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
      this.loading=false
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

  public eliminarCurso(id:string){
    Swal.fire({
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
        this.loading=true
        this._cursoService.deleteCurso(id).subscribe((data:any)=>{
          this.loading=false
          if(data['Response']=='borrado'){
            Swal.fire({
              type:'success',
              title: 'Recurso Eliminado',
              text: 'Se ha eliminado el recurso satifactoriamente',
              confirmButtonColor: '#2dce89',
              confirmButtonText: 'Aceptar',
            }).then((result)=>{
              if(result.value || result.dismiss){
                this.cursosDesactivados();
              }
            })
          }
        })
      }
      else if(result.dismiss){
      }
    })
  }
}
