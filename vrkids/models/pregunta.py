from db import db
from datetime import datetime
from models.alternativa import Alternativa
from models.habilidad import Habilidad

TIPOS_PREGUNTA = [
    ("ALTERNATIVA", "ALTERNATIVA"),
    ("TEXTO", "TEXTO"),
    ("VERDADERO_FALSO", "VERDADERO_FALSO"),
    ("UNIR_IMAGENES", "UNIR_IMAGENES"),
    ("UNIR_TEXTOS", "UNIR_TEXTOS"),
    ("UNIR_IMAGEN_TEXTO", "UNIR_IMAGEN_TEXTO"),
    ]
class Pregunta(db.EmbeddedDocument):
    tipo_pregunta = db.StringField(choices=TIPOS_PREGUNTA)
    texto = db.StringField()
    alternativas = db.ListField(db.EmbeddedDocumentField(Alternativa))
    habilidad = db.ReferenceField(Habilidad, requiered=True)
    indice = db.IntField()
    meta = {'strict': False}

    def to_dict(self):
        habilidad = ""
        if self.habilidad != None:
            habilidad = self.habilidad.to_dict()
        alternativas = []
        contador = 0
        for alternativa in self.alternativas:
            numero_alternativa = contador
            alternativas.append(alternativa.to_dict())
            contador = contador + 1
        return{
            "texto": self.texto,
            "tipo_pregunta": self.tipo_pregunta,
            "alternativas": alternativas,
            "habilidad": habilidad,
            "indice": self.indice
        }