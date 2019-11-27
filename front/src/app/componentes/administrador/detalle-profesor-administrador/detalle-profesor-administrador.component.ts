import { Component, OnInit } from '@angular/core';
import { ProfesorService } from 'src/app/servicios/profesor.service';
import { CursoService} from 'src/app/servicios/curso.service';
import { AsignaturaService } from 'src/app/servicios/asignatura.service';
import { GradoService } from 'src/app/servicios/grado.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Config } from '../../../config';
import swal from'sweetalert2';
@Component({
  selector: 'app-detalle-profesor-administrador',
  templateUrl: './detalle-profesor-administrador.component.html',
  styleUrls: ['./detalle-profesor-administrador.component.css']
})
export class DetalleProfesorAdministradorComponent implements OnInit {
  profesor:any;
  cursos:any;
  pageCursosProfesor: number;
  pageSizeCursosProfesor: number;
  collectionSizeCursosProfesor: number;
  id_detalle:string;
  loading=false
  contadorLoading=0
  constructor(private _profesorService:ProfesorService, 
              private _cursoService: CursoService,
              private _asignaturaService: AsignaturaService,
              private _gradoService: GradoService,
              private _router: Router,
              private _activatedRoute: ActivatedRoute) {
    this.profesor = [];
    this.cursos = [];
    this.pageCursosProfesor = 1;
    this.pageSizeCursosProfesor = 4;
  }

  ngOnInit() {
    this.id_detalle = this._activatedRoute.snapshot.paramMap.get('id')
    this.getProfesor();
    this.getCursos();
  }

  public editarFoto(event){
    if (event.target.files && event.target.files[0]) {
      var file = event.target.files[0]
      var formData = new FormData()
      formData.append('imagen',file)
      this.loading=true
      this._profesorService.uploadImage(formData, this.id_detalle).subscribe((data:any)=>{
        if(data['Response']=="exito"){
          this.loading=false
          swal.fire({
            title: 'Registro exitoso',
            text: 'Se ha editado al profesor exitosamente!',
            type: 'success',
            confirmButtonColor: '#2dce89',
          }).then((result)=>{
            this.getProfesor()
            location.reload()
          })
        }
      })
    }
  }

  public getProfesor(){
    this._profesorService.getProfesor(this.id_detalle).subscribe((data:any)=>{
      this.profesor = data;
      if (this.profesor.imagen == ""){
        this.profesor.imagen = Config.API_SERVER_URL+"/profesor/imagen/default"
      }
      else{
        this.profesor.imagen = Config.API_SERVER_URL+"/profesor/imagen/"+this.profesor.imagen
      }
      if(this.contadorLoading<2){
        this.contadorLoading = this.contadorLoading +1
      } 
    })
  }

  public getCursos(){
    this._cursoService.getCursosProfesor(this.id_detalle).subscribe((data:any)=>{
      this.cursos = data;
      this.collectionSizeCursosProfesor = this.cursos.length;
      for(let curso of this.cursos){
        if(curso.asignatura != null){
          this._asignaturaService.getAsignatura(curso.asignatura).subscribe((asignatura:any)=>{
            curso.asignatura = asignatura.nombre
          })
        }
        if(curso.alumnos!=null){
          curso.alumnos = curso.alumnos.length
        }
        if(curso.alumnos == null){
          curso.alumnos = 0
        }
        if(curso.grado != null){
          this._gradoService.getGrado(curso.grado).subscribe((grado:any)=>{
            curso.grado = grado.nivel.toString()+"°"+grado.identificador
          })
        }
      }
      if(this.contadorLoading<2){
        this.contadorLoading = this.contadorLoading +1
      } 
    })
  }

  get cursos_tabla(): any[] {
    return this.cursos
      .map((curso, i) => ({id: i + 1, ...curso}))
      .slice((this.pageCursosProfesor - 1) * this.pageSizeCursosProfesor, (this.pageCursosProfesor - 1) * this.pageSizeCursosProfesor + this.pageSizeCursosProfesor);
  }
  public cancelar(){
    this._router.navigateByUrl('/admin/perfiles');
  }
}
