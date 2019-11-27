from db import db
from datetime import datetime
from models.pregunta import Pregunta

class Contenido(db.EmbeddedDocument):
    texto = db.StringField()
    preguntas = db.ListField(db.EmbeddedDocumentField(Pregunta))
    identificador = db.IntField()
    imagen = db.StringField(default="default")
    meta = {'strict': False}

    def to_dict(self):
        preguntas = []
        contador = 0
        for pregunta in self.preguntas:
            pregunta.indice = contador
            preguntas.append(pregunta.to_dict())
            contador = contador + 1
        return{
            "texto": self.texto,
            "preguntas": preguntas,
            "identificador": self.identificador,
            "imagen": self.imagen
        }