import { Component, OnInit} from '@angular/core';
import { AlumnoService } from 'src/app/servicios/alumno.service';
import { CursoService} from 'src/app/servicios/curso.service';
import { AsignaturaService } from 'src/app/servicios/asignatura.service';
import { GradoService } from 'src/app/servicios/grado.service';
import { ActivatedRoute, Router } from '@angular/router'
import { Config } from '../../../config';
import swal from'sweetalert2';
@Component({
  selector: 'app-detalle-alumno-administrador',
  templateUrl: './detalle-alumno-administrador.component.html',
  styleUrls: ['./detalle-alumno-administrador.component.css']
})
export class DetalleAlumnoAdministradorComponent implements OnInit {
  alumno:any;
  cursos:any;
  pageCursosAlumno: number;
  pageSizeCursosAlumno: number;
  collectionSizeCursosAlumno: number;
  id_detalle:string;
  loading = false;
  contadorLoading = 0
  constructor(private _alumnoService:AlumnoService, 
              private _cursoService: CursoService,
              private _asignaturaService: AsignaturaService,
              private _gradoService: GradoService,
              private _router: Router,
              private _activatedRoute: ActivatedRoute) {
    this.alumno = [];
    this.cursos = [];
    this.pageCursosAlumno = 1;
    this.pageSizeCursosAlumno = 4;
  }

  ngOnInit() {
    this.id_detalle = this._activatedRoute.snapshot.paramMap.get('id')
    this.getAlumno();
    this.getCursos();
  }

  public getAlumno(){
    this._alumnoService.getAlumno(this.id_detalle).subscribe((data:any)=>{
      this.alumno = data;
      if (this.alumno.imagen == ""){
        this.alumno.imagen = Config.API_SERVER_URL+"/alumno/imagen/default"
        //this.loadImage(this.alumno.imagen)
      }
      else{
        this.alumno.imagen = Config.API_SERVER_URL+"/alumno/imagen/"+this.alumno.imagen
        //this.loadImage(this.alumno.imagen)
      }
      if(this.contadorLoading<2){
        this.contadorLoading = this.contadorLoading +1
      }
    })
  }

  public editarFoto(event){
    if (event.target.files && event.target.files[0]) {
      var file = event.target.files[0]
      var formData = new FormData()
      formData.append('imagen',file)
      this.loading = true;
      this._alumnoService.uploadImage(formData, this.id_detalle).subscribe((data:any)=>{
        if(data['Response']=="exito"){
          this.loading = false;
          swal.fire({
            title: 'Registro exitoso',
            text: 'Se ha editado al alumno exitosamente!',
            type: 'success',
            confirmButtonColor: '#2dce89',
          }).then((result)=>{
            this.getAlumno()
            location.reload()
          })
        }
      })
      this.loading = false;
    }
  }

  public getCursos(){
    this._cursoService.getCursosAlumno(this.id_detalle).subscribe((data:any)=>{
      this.cursos = data;
      this.collectionSizeCursosAlumno = this.cursos.length;
    },
    (error)=>{console.log("error")})
    if(this.contadorLoading<2){
      this.contadorLoading = this.contadorLoading +1
    }
  }

  get cursos_tabla(): any[] {
    return this.cursos
      .map((curso, i) => ({id: i + 1, ...curso}))
      .slice((this.pageCursosAlumno - 1) * this.pageSizeCursosAlumno, (this.pageCursosAlumno - 1) * this.pageSizeCursosAlumno + this.pageSizeCursosAlumno);
  }
  public cancelar(){
    this._router.navigateByUrl('/admin/perfiles');
  }
}
