import { Opcion } from './opcion.model';

export class Respuesta{
    correcta:boolean
    indice_pregunta:number
    opciones: Opcion[]
    indice_contenido:number
}