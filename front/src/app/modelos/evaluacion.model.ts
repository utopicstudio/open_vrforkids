import { Alumno } from './alumno.model';
import { Curso } from './curso.model';
import { Respuesta } from './respuesta.model';

export class Evaluacion{
    id:string
    alumno: Alumno
    curso: Curso
    acierto: number
    imagen: string
    creado: string
    actualizado: string
    respuesta: Respuesta[]
    json: string
}