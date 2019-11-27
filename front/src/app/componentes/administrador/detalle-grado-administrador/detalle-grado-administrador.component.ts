import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
//SERVICIOS
import { AlumnoService } from 'src/app/servicios/alumno.service';
import { GradoService } from 'src/app/servicios/grado.service';
import { CursoService } from 'src/app/servicios/curso.service';
//MODELOS
import { Alumno } from 'src/app/modelos/alumno.model';
import { Grado } from 'src/app/modelos/grado.model';
import { Curso } from 'src/app/modelos/curso.model';
import { Config } from 'src/app/config';
@Component({
  selector: 'app-detalle-grado-administrador',
  templateUrl: './detalle-grado-administrador.component.html',
  styleUrls: ['./detalle-grado-administrador.component.css']
})
export class DetalleGradoAdministradorComponent implements OnInit {
  id_detalle:string;
  alumnos:Alumno[];
  cursos: Curso[];
  grado: Grado;
  collectionSizeAlumno:number
  pageAlumno: number;
  pageSizeAlumno: number;
  collectionSizeCurso:number
  pageCurso: number;
  pageSizeCurso: number;
  constructor(private _gradoService: GradoService, 
    private _activatedRoute: ActivatedRoute, 
    private _alumnoService: AlumnoService,
    private _cursoService: CursoService, 
    private _router:Router
  ){ 
    this.cursos = []
    this.alumnos =[]
    this.pageAlumno = 1
    this.pageSizeAlumno = 4
    this.pageCurso = 1
    this.pageSizeCurso = 4
  }

  ngOnInit() {
    this.id_detalle = this._activatedRoute.snapshot.paramMap.get('id')
    this.grado = {'id':"",'nivel':1,'identificador':""}
    this.getGrado()
    this.getCursoGrado()
    this.getAlumnosGrado()
  }

  getCursoGrado(){
    this._cursoService.getCursosDeGrado(this.id_detalle).subscribe((data:Curso[])=>{
      this.cursos = data
      for(let curso of this.cursos){
        curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/"+curso.imagen
      }
      this.collectionSizeCurso = this.cursos.length;
    })
  }

  getGrado(){
    this._gradoService.getGrado(this.id_detalle).subscribe((data:Grado)=>{
      this.grado = data
    })
  }
  getAlumnosGrado(){
  	this._alumnoService.getAlumnosGrado(this.id_detalle).subscribe((data: Alumno[]) => {
      this.alumnos = data;
      for(let alumno of this.alumnos){
        alumno.imagen = Config.API_SERVER_URL+"/alumno_imagen/"+alumno.imagen
      }
      this.collectionSizeAlumno = this.alumnos.length;
    });
  }

  get alumnos_tabla(): any[] {
    return this.alumnos
      .map((alumno, i) => ({id: i + 1, ...alumno}))
      .slice((this.pageAlumno - 1) * this.pageSizeAlumno, (this.pageAlumno - 1) * this.pageSizeAlumno + this.pageSizeAlumno);
  }


  get cursos_tabla(): any[] {
    return this.cursos
      .map((curso, i) => ({id: i + 1, ...curso}))
      .slice((this.pageCurso - 1) * this.pageSizeCurso, (this.pageCurso - 1) * this.pageSizeCurso + this.pageSizeCurso);
  }

  public verDetallePerfil(tipo:string,id:string){
    if(tipo=='alumno'){
      this._router.navigateByUrl('/admin/perfiles/detalle_alumno/'+id)
    }
    if(tipo=='profesor'){
      this._router.navigateByUrl('/admin/perfiles/detalle_profesor/'+id)
    }
  }
  volver(){
    this._router.navigateByUrl('/admin/grados');
  }
  
  public ver_detalle_curso(id:string){
    this._router.navigateByUrl('/admin/cursos/detalle_curso/'+id)
  }
}
