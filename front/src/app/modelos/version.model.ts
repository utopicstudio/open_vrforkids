import { Contenido } from './contenido.model';
import { Curso } from './curso.model';
import { Habilidad } from './habilidad.model';
export class Version {
    id:string
    nombre:string
    fecha_creacion:string
    contenidos: Contenido[]
    activo: boolean
    actual: boolean
    recurso: Curso
    habilidades: Habilidad[]
}