from db import db
from datetime import datetime
from models.contenido import Contenido
from models.asignatura import Asignatura
from models.institucion import Institucion
from models.alumno import Alumno
from models.profesor import Profesor
from models.grado import Grado
from models.curso_base import CursoBase
from models.categoria import Categoria
from models.habilidad import Habilidad
import mongoengine_goodjson as gj

class Curso(gj.Document):
    nombre = db.StringField(verbose_name="Nombre curso", max_length=200)
    fecha_creacion = db.DateTimeField(default=datetime.now)
    contenidos = db.ListField(db.EmbeddedDocumentField(Contenido))
    asignatura = db.ReferenceField(Asignatura)
    institucion = db.ReferenceField(Institucion)
    profesor = db.ReferenceField(Profesor)
    categoria = db.ReferenceField(Categoria)
    alumnos = db.ListField(db.ReferenceField(Alumno))
    activo = db.BooleanField(default=True)
    version_actual = db.BooleanField(default=True)
    publicado = db.BooleanField(default=False)
    eliminado = db.BooleanField(default=False)
    version = db.IntField(default=1)
    curso_base = db.ReferenceField(CursoBase, reverse_delete_rule=3)
    descripcion = db.StringField()
    aprobacion = db.IntField( default=0 )
    imagen = db.StringField()
    habilidades = db.ListField(db.ReferenceField(Habilidad))
    clon_padre = db.ReferenceField('Curso')
    meta = {'strict': False }
    
    def __str__(self):
        return self.nombre
    
    def actualizar_aprobacion(self):
        from models.evaluacion import Evaluacion
        promedio = 0
        cantidad = Evaluacion.objects(curso=self.id).count()
        for evaluacion in Evaluacion.objects(curso=self.id).all():
            promedio = evaluacion.acierto + promedio
        if cantidad>0:
            promedio = int(promedio/cantidad)
        self.aprobacion = promedio

    def to_dict(self, full=True):
        data = {
            "id": str(self.id),
            "nombre": self.nombre,
            "fecha_creacion": str(self.fecha_creacion),
            "activo": self.activo,
            "eliminado": self.eliminado,
            "publicado": self.publicado,
            "version": self.version,
            "descripcion": self.descripcion,
            "imagen": self.imagen,
            "curso_base": self.curso_base.to_dict()
        }
        if self.profesor:
            data['profesor'] = self.profesor.to_dict()
        if self.categoria:
            data['categoria'] = self.categoria.to_dict()
        if full:
            clon_padre = {}
            if self.clon_padre != None:
                clon_padre = self.clon_padre.to_dict()
            data.update({
                "contenidos":  [x.to_dict() for x in self.contenidos],
                "alumnos":     [x.to_dict() for x in self.alumnos],
                "aprobacion":  self.aprobacion,
                "curso_base":  self.curso_base.to_dict(),
                "habilidades": [x.to_dict() for x in self.habilidades],
                "clon_padre": clon_padre,
                "version_actual": self.version_actual
            })
            if self.asignatura:
                data['asignatura'] = self.asignatura.to_dict()
        return data
