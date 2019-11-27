import { Component, OnInit,ViewChild, ElementRef } from '@angular/core';
import { CursoService } from '../../../servicios/curso.service';
import { AlumnoService } from '../../../servicios/alumno.service';
import { GradoService } from '../../../servicios/grado.service';
import { StorageService } from '../../../servicios/storage.service';
import { ProfesorService } from 'src/app/servicios/profesor.service';
import { Config } from 'src/app/config';
import Swal from 'sweetalert2';
import * as $ from 'jquery';
import { TourService, IStepOption } from 'ngx-tour-md-menu';
import { LocalService } from 'src/app/servicios/local.service';
@Component({
  selector: 'app-alumnos-profesor',
  templateUrl: './alumnos-profesor.component.html',
  styleUrls: ['./alumnos-profesor.component.css']
})
export class AlumnosProfesorComponent implements OnInit {

	cursos:any;
  pageAlumno:number;
  pageSizeAlumno:number;
  collectionSizeAlumno:number;
  token:string
  id:string
  loading=false
  constructor(private localService: LocalService,private _profesorService:ProfesorService, public tourService: TourService,private _storageService: StorageService, private _cursoService: CursoService, private _alumnoService: AlumnoService, private _gradoService: GradoService) {
  	this.pageAlumno = 1;
    this.pageSizeAlumno = 4;
    this.cursos = [];
    this.tourService.enableHotkeys()
    this.tourService.initialize([
    {
      anchorId: 'menu_profesor.mis_cursos',
      content: 'Para conocer el detalle de tus cursos debes hacer click en esta sección.',
      placement: 'auto',
      title: 'Mis Cursos',
      enableBackdrop: false,
      nextBtnTitle: 'Sig',
      prevBtnTitle	: 'Ant',
      endBtnTitle : 'Terminar',
    },
    {
      anchorId: 'mis_cursos',
      content: 'En esta sección se muestran tus cursos y el detalle de cada uno.',
      placement: 'auto',
      title: 'Mis Cursos',
      enableBackdrop: false,
      nextBtnTitle: 'Sig',
      prevBtnTitle	: 'Ant',
      endBtnTitle : 'Terminar',
    },
    {
      anchorId: 'menu_profesor.cerrar_session',
      content: 'Para finalizar tu sesión debes hacer click aquí.',
      placement: 'auto',
      title: 'Cerrar Sesión',
      enableBackdrop: false,
      nextBtnTitle: 'Sig',
      prevBtnTitle	: 'Ant',
      endBtnTitle : 'Terminar',
    }
    ])
  }

  @ViewChild('prueba') myDiv: ElementRef;

  ngOnInit() {
    if(this._storageService.getCurrentToken()==null || this._storageService.getCurrentUser().id==null){
      this.token = this.localService.getToken()
      this.id = this.localService.getId()
    }
    else{
      this.token = this._storageService.getCurrentToken()
      this.id = this._storageService.getCurrentUser().id
    }
    this.getCursosProfesor();
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

  get cursos_tabla(): any[] {
    return this.cursos
      .map((alumno, i) => ({id: i + 1, ...alumno}))
      .slice((this.pageAlumno - 1) * this.pageSizeAlumno, (this.pageAlumno - 1) * this.pageSizeAlumno + this.pageSizeAlumno);
  }

  public getCursosProfesor():void {
    this.loading=true
  	this._gradoService.getGradosProfesor(this.id).subscribe((data: Array<any>) => {
      this.loading=false
      this.cursos = data;
      this.collectionSizeAlumno = this.cursos.length;
  	});
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

    Swal.fire({
      title: 'Alumnos Curso '+nivel.toString()+"º"+identificador,
      type: 'info',
      html: html,
      confirmButtonColor: '#2dce89',
      confirmButtonText: 'Ok'
    });
  }

}
