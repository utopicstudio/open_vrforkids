from db import db
from datetime import datetime
from models.contenido import Contenido
from models.categoria import Categoria
from models.habilidad import Habilidad
 
import mongoengine_goodjson as gj



class CursoBase(gj.Document):
    nombre = db.StringField(verbose_name="Nombre curso", max_length=200)
    descripcion = db.StringField()
    fecha_creacion = db.DateTimeField(default=datetime.now)
    contenidos = db.ListField(db.EmbeddedDocumentField(Contenido))
    categoria = db.ReferenceField(Categoria, requiered=True)
    habilidades = db.ListField(db.ReferenceField(Habilidad)) 
    imagen = db.StringField()

    # juego
    android = db.URLField(help_text="Url para android")
    ios = db.URLField(help_text="Url para ios")

    meta = {'strict': False}

    def __str__(self):
        return self.nombre
    
    def to_dict(self):
        contenidos = []
        contador = 0
        for contenido in self.contenidos:
            contenido.indentificador = contador
            contenidos.append(contenido.to_dict())
            contador = contador + 1

        habilidades = []
        for habilidad in self.habilidades:
            habilidades.append(habilidad.to_dict())
        
        categoria = {}
        if self.categoria:
            categoria = self.categoria.to_dict()
        
        
        self.save()
        return{
            "id": str(self.id),
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "fecha_creacion": str(self.fecha_creacion),
            "contenidos": contenidos,
            "imagen": self.imagen,
            "categoria": categoria,
            "habilidades": habilidades
        }
