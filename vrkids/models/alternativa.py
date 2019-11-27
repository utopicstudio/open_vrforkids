from db import db
from datetime import datetime

class Alternativa(db.EmbeddedDocument):
    texto = db.StringField()
    texto_secundario = db.StringField()
    correcta = db.BooleanField(default=False)
    numero_alternativa = db.IntField(default=0)
    meta = {'strict': False}

    def to_dict(self):
        return{
            "texto": self.texto,
            "texto_secundario": self.texto_secundario,
            "correcta": self.correcta,
            "numero_alternativa": self.numero_alternativa,
            "numero_opcion": self.numero_alternativa
        }