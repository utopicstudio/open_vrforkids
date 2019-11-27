import { Component, OnInit } from '@angular/core';
import { CursoService } from 'src/app/servicios/curso.service';
import { AlumnoService } from 'src/app/servicios/alumno.service';
import { Router } from '@angular/router'
import { StorageService } from 'src/app/servicios/storage.service';
import { Config } from 'src/app/config';
import { TourService, IStepOption } from 'ngx-tour-md-menu';
import swal from'sweetalert2';
import { LocalService } from 'src/app/servicios/local.service';
import { Curso } from 'src/app/modelos/curso.model';
import { Evaluacion } from 'src/app/modelos/evaluacion.model';
@Component({
  selector: 'app-cursos-alumno',
  templateUrl: './cursos-alumno.component.html',
  styleUrls: ['./cursos-alumno.component.css']
})
export class CursosAlumnoComponent implements OnInit {
  pageCurso: number;
  pageSizeCurso: number;
  collectionSizeCurso: number;
  cursos:Curso[]=[]
  evaluaciones:Evaluacion[]=[]
  token:string
  id:string
  contadorLoading=0
  constructor(private _cursoService: CursoService, 
              private _router: Router, 
              private localService: LocalService,
              private _storageService: StorageService,
              public tourService: TourService,
              private _alumnoService: AlumnoService
  ) {
    this.pageCurso = 1;
    this.pageSizeCurso = 4;
    this.tourService.enableHotkeys()
    this.tourService.initialize([
      {
        anchorId: 'menu',
        content: 'Este es el menú de navegación. En el podrás acceder a las distintas funcionalidades de la plataforma.',
        placement: 'auto',
        title: 'Menu de Navegación',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'menu.mis_recursos',
        content: 'Para poder ver todos tus recursos debes hacer click aquí.',
        placement: 'auto',
        title: 'Mis Recursos',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'mis_recursos',
        content: 'En esta sección aparecerán todos tus recursos. Además podrás ver el detalle de tus resultados y poder jugar.',
        placement: 'auto',
        title: 'Mis Recursos',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        route: 'alumno/solicitudes'
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
    this.getEvaluaciones();
    this.getAlumno();
    this.tutorial();

  }

  public terminarTutorial(){
    this.tourService.end()
    this._alumnoService.finalizarTutorial(this.id).subscribe((data:any)=>{
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
    this._alumnoService.getAlumno(this.id).subscribe((data:any)=>{
      if(data['primera_vez']){
        swal.fire({
          type:'question',
          title:'Tutorial Bienvenida!',
          text: 'Desea un recorrido dentro de la plataforma?',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'No mostrar',
          showCancelButton: true,
          confirmButtonColor: '#2dce89',
          cancelButtonColor: '#fb6340',
          allowEscapeKey: false,
          allowOutsideClick: false
  
        }).then((result)=>{
          if(result.dismiss ==null){
            this.tourService.start()
          }
  
          else{
            this._alumnoService.finalizarTutorial(this.id).subscribe((data:any)=>{
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
  
        })
      }
    })

  }

  get cursos_tabla(): any[] {
    return this.cursos
      .map((curso, i) => ({id: i + 1, ...curso}))
      .slice((this.pageCurso - 1) * this.pageSizeCurso, (this.pageCurso - 1) * this.pageSizeCurso + this.pageSizeCurso);
  }

  public getCursos(id: any){
  	this._cursoService.getCursosAlumno(id).subscribe((data: Curso[]) => {
      this.cursos = data;
      this.collectionSizeCurso = this.cursos.length;
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
    });
  }

  public getAlumno():void{
  	this.getCursos(this.id)
  }

  public ver_detalle_curso(curso: Curso){
  	this._router.navigateByUrl('/alumno/recursos/detalle_recurso/'+curso.id);
  }

  verificarJugar(curso:Curso):boolean{
    for(let evaluacion of this.evaluaciones){
      if(evaluacion.curso['id']==curso['id']){
        return true
      }
    }
    return false
  }

  getEvaluaciones(){
    this._alumnoService.getAlumnoEvaluaciones(this.id).subscribe((data:Evaluacion[])=>{
      this.evaluaciones = data
      if(this.contadorLoading<2){
        this.contadorLoading = this.contadorLoading +1
      }
    })
  }
}
