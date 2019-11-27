from db import db
from datetime import datetime

class RespuestaOpcion(db.EmbeddedDocument):
    numero_opcion = db.IntField()
    data = db.StringField()
    correcta = db.BooleanField(default=False)

    def to_dict(self):
        return {
            "numero_opcion": self.numero_opcion,
            "correcta": self.correcta,
            "data": self.data
        }

class Respuesta(db.EmbeddedDocument):
    correcta = db.BooleanField(default=False)
    indice_pregunta = db.IntField()
    opciones = db.ListField(db.EmbeddedDocumentField(RespuestaOpcion))
    indice_contenido = db.IntField()
    meta = {'strict': False}

    def to_dict(self):
        opciones = []
        for opcion in self.opciones:
            opciones.append(opcion.to_dict())
        return{
            "correcta": self.correcta,
            "indice_pregunta": self.indice_pregunta,
            "indice_contenido": self.indice_contenido,
            "opciones": opciones
        }
    
    def sort_respuestas(respuestas):
        resultado = []
        for res in respuestas:
            resultado.append('')
        for res in respuestas:
            resultado[(int(res['indice_pregunta']))] = res
            resultado[(int(res['indice_pregunta']))]['indice_pregunta'] = res['indice_pregunta'] + 1
        return resultado