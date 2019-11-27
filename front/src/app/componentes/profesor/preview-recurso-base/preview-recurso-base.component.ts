import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CursoBase } from 'src/app/modelos/curso_base.model';
import { CursoService } from 'src/app/servicios/curso.service';
import { Config } from 'src/app/config';
import { Habilidad } from 'src/app/modelos/habilidad.model';
import { Contenido } from 'src/app/modelos/contenido.model';
import Swal from 'sweetalert2';
import { Pregunta } from 'src/app/modelos/pregunta.model';

@Component({
  selector: 'app-preview-recurso-base',
  templateUrl: './preview-recurso-base.component.html',
  styleUrls: ['./preview-recurso-base.component.css']
})
export class PreviewRecursoBaseComponent implements OnInit {
  id_detalle:string;
  recursoBase: CursoBase;
  habilidades: Habilidad[];
  contenidos: Contenido[];
  preguntas: Pregunta[];
  pageRecursoBase: number;
  pageSizeRecursoBase: number;
  collectionSizeRecursoBase: number;
  pageHabilidad: number;
  pageSizeHabilidad: number;
  collectionSizeHabilidad: number;
  pagePreguntas: number;
  pageSizePreguntas: number;
  collectionSizePreguntas: number;
  verTablaPreguntas: boolean
  loading=false
  constructor(private _router: Router, private _recursoService: CursoService, private _activatedRoute: ActivatedRoute)
  {
    this.recursoBase = new CursoBase()
    this.habilidades = [];
    this.contenidos = [];
    this.preguntas = [];
    this.pageRecursoBase = 1;
    this.pageSizeRecursoBase = 4;
    this.pageHabilidad = 1;
    this.pageSizeHabilidad = 4;
    this.pagePreguntas = 1;
    this.pageSizePreguntas = 4;
    this.verTablaPreguntas = false;

  }

  ngOnInit() {
    this.id_detalle = this._activatedRoute.snapshot.paramMap.get('id')
    this.getCursoBase()
  }

  getCursoBase(){
    this.loading=true
    this._recursoService.getCursoBase(this.id_detalle).subscribe((data:CursoBase)=>{
      this.recursoBase = data
      for(let contenido of this.recursoBase.contenidos){
        contenido.identificador = contenido.identificador+1
        for(let pregunta of contenido.preguntas){
          pregunta.indice = pregunta.indice+1
          for(let alternativa of pregunta.alternativas){
            alternativa.numero_alternativa = alternativa.numero_alternativa +1
          }
        }
        
      }
      this.collectionSizeHabilidad = this.recursoBase.habilidades.length
      for(let contenido of this.recursoBase.contenidos){
        contenido.imagen = Config.API_SERVER_URL+"/contenidos/imagen/"+contenido.imagen
      }

      for(let habilidad of this.recursoBase.habilidades){
        var contador = 0
        for(let contenido of this.recursoBase.contenidos){
          for(let pregunta of contenido.preguntas){
            if(pregunta.habilidad.id == habilidad.id){
              contador = contador + 1
            }
          }
        }
        habilidad['preguntas'] = contador
      }
      this.habilidades = this.recursoBase.habilidades
      this.contenidos = this.recursoBase.contenidos
      this.collectionSizeRecursoBase = this.recursoBase.contenidos.length
      if (this.recursoBase.imagen == ""){
        this.recursoBase.imagen = Config.API_SERVER_URL+"/recurso/imagen/default"
      }
      else{
        this.recursoBase.imagen = Config.API_SERVER_URL+"/recurso/imagen/"+this.recursoBase.imagen
      }
      this.loading=false
    })
  }

  cancelar(){
    this._router.navigateByUrl('/profesor/recursos_disponibles'); 
  }

  verAlternativas(alternativas: any, numero_pregunta: any, tipo:string): void{
    let html = '';
    if(tipo=="ALTERNATIVA" || tipo=="VERDADERO_FALSO"){
      html += '<table class="table table-striped">';
      html += '<thead>';
        html += '<tr>';
          html += '<th scope="col">Alternativa</th>';
          html += '<th scope="col">Texto</th>';
          html += '<th scope="col">Correcta</th>';
        html += '</tr>';
      html += '</thead>';
      html += '<tbody>';
        for(var i = 0; i < alternativas.length; i++) {
           html += '<tr>';
             if(i == 0)
               html += '<th scope="row">A</th>';
             else if(i == 1)
               html += '<th scope="row">B</th>';
             else
               html += '<th scope="row">C</th>';
             html += '<td>'+alternativas[i].texto+'</td>';
             if(alternativas[i].correcta) {
               html += '<td><i class="fas fa-check-circle text-success"></i></td>';
             }
             else {
               html += '<td><i class="fas fa-times text-danger"></i></td>';
             }
           html += '</tr>';
        }
      html += '</tbody>';
     html += '</table>';
    }

    if(tipo=="UNIR_IMAGENES" || tipo=="UNIR_TEXTOS" || tipo=="UNIR_IMAGEN_TEXTO" ){
      html += '<table class="table table-striped">';
      html += '<thead>';
        html += '<tr>';
          html += '<th scope="col">Alternativa</th>';
          html += '<th scope="col">Primera Opción</th>';
          html += '<th scope="col">Segunda Opción</th>';
        html += '</tr>';
      html += '</thead>';
      html += '<tbody>';
        for(var i = 0; i < alternativas.length; i++) {
           html += '<tr>';
             if(i == 0)
               html += '<th scope="row">A</th>';
             else if(i == 1)
               html += '<th scope="row">B</th>';
             else
               html += '<th scope="row">C</th>';
            if(tipo=="UNIR_TEXTOS" ){
              html += '<td>'+alternativas[i].texto+'</td>';
              html += '<td>'+alternativas[i].texto_secundario+'</td>';
            }
            if(tipo=="UNIR_IMAGEN_TEXTO" ){
              html += '<td>'+alternativas[i].texto+'</td>';
              html += '<td><img [src]='+alternativas[i].texto_secundario+' class="mr-2" style="width: 10px"></td>';
            }
            if(tipo=="UNIR_IMAGENES" ){
              html += '<th scope="row"><img [src]='+alternativas[i].texto+' class="mr-2" style="width: 5px"></th>';
              html += '<th scope="row"><img [src]='+alternativas[i].texto_secundario+' class="mr-2" style="width: 5px"></th>';
            }
           html += '</tr>';
        }
      html += '</tbody>';
     html += '</table>';
    }


    Swal.fire({
      title: 'Alternativas Pregunta '+numero_pregunta,
      type: 'info',
      html: html,
      confirmButtonColor: '#2dce89',
      confirmButtonText: 'Ok'
    });
  }

  verPreguntas(preguntas:Pregunta[]){
    this.verTablaPreguntas = true
    this.pagePreguntas = 1
    this.pageSizePreguntas = 4
    this.preguntas = preguntas
    this.collectionSizePreguntas = this.preguntas.length
  }

  verContenidos(){
    this.verTablaPreguntas = false
  }
  get habilidades_tabla(): any[] {
    return this.habilidades
      .map((habilidad, i) => ({id: i + 1, ...habilidad}))
      .slice((this.pageHabilidad - 1) * this.pageSizeHabilidad, (this.pageHabilidad - 1) * this.pageSizeHabilidad + this.pageSizeHabilidad);
  }

  get contenidos_tabla(): any[] {
    return this.contenidos
      .map((contenido, i) => ({id: i + 1, ...contenido}))
      .slice((this.pageRecursoBase - 1) * this.pageSizeRecursoBase, (this.pageRecursoBase - 1) * this.pageSizeRecursoBase + this.pageSizeRecursoBase);
  }

  get preguntas_tabla(): any[] {
    return this.preguntas
      .map((pregunta, i) => ({id: i + 1, ...pregunta}))
      .slice((this.pagePreguntas - 1) * this.pageSizePreguntas, (this.pagePreguntas - 1) * this.pageSizePreguntas + this.pageSizePreguntas);
  }
}
