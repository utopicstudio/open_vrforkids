import { Alternativa } from './alternativa.model';
import { Habilidad } from './habilidad.model';
export class Pregunta{
    texto: string
    tipo_pregunta: string
    alternativas: Alternativa[]
    habilidad: Habilidad
    indice: number
    imagen:string
}