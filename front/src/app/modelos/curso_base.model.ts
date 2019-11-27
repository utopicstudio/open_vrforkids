import { Contenido } from './contenido.model';
import { Categoria } from './categoria.model';
import { Habilidad } from './habilidad.model';
export class CursoBase{
    id: string
    nombre: string
    fecha_creacion: string
    contenidos: Contenido[]
    descripcion: string
    imagen: string
    categoria: Categoria
    habilidades: Habilidad[]
}