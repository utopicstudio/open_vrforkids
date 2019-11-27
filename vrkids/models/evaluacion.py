from db import db
from datetime import datetime
from models.institucion import Institucion
from models.alumno import Alumno
from models.curso import Curso
from models.respuesta import Respuesta
import mongoengine_goodjson as gj

class Evaluacion(gj.Document):
    alumno = db.ReferenceField(Alumno)
    curso = db.ReferenceField(Curso)
    acierto = db.IntField(default=0)
    creado = db.DateTimeField(default=datetime.now)
    actualizado = db.DateTimeField(default=datetime.now)
    respuestas = db.ListField(db.EmbeddedDocumentField(Respuesta))
    json = db.StringField()
    meta = {'strict': False}

    def save(self, *args):
        self.actualizado = datetime.now()
        super().save()


    def to_dict(self):
        contenidos_respuesta = []
        for respuesta in self.respuestas:
            contenidos_respuesta.append(respuesta.to_dict())
        return{
            "id": str(self.id),
            "alumno": self.alumno.to_dict(False),
            "recurso": str(self.curso.id),
            "recurso_nombre": self.curso.nombre,
            "respuestas": contenidos_respuesta,
            "acierto": self.acierto
        }
