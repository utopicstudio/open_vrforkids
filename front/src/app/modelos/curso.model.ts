import { Pregunta } from './pregunta.model';
import { Asignatura } from './asignatura.model';
import { Profesor } from './profesor.model';
import { Alumno } from './alumno.model';
import { Grado } from './grado.model';
import { CursoBase } from './curso_base.model';
import { Habilidad } from './habilidad.model';
import { Contenido } from 'src/app/modelos/contenido.model';
import { Categoria } from 'src/app/modelos/categoria.model';
import { Institucion } from './institucion.model';
export class Curso{
    id: string;
    nombre: string;
    fecha_creacion: string;
    asignatura: Asignatura;
    profesor: Profesor;
    alumnos: Alumno[];
    grado: Grado;
    activo: boolean;
    version: string;
    curso_base: CursoBase;
    descripcion: string;
    aprobacion: number;
    imagen: string
    habilidades: Habilidad[]
    contenidos: Contenido[]
    categoria: Categoria
    publicado: boolean
    institucion: Institucion
    version_actual:boolean
    clon_padre: Curso
}