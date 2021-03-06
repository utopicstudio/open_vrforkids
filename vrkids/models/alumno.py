from db import db
from datetime import datetime
from models.institucion import Institucion
from models.grado import Grado
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
import mongoengine_goodjson as gj
import mongoengine as me
from itsdangerous import (TimedJSONWebSignatureSerializer as Serializer,
                          BadSignature, SignatureExpired)
from flask import (
    Blueprint,
    request,
    render_template,
    flash,
    redirect,
    url_for,
    current_app,
    abort,
    Response,
    jsonify
    )

class Alumno(gj.Document, UserMixin):
    nombres = db.StringField()
    apellido_paterno = db.StringField(max_length=20)
    apellido_materno = db.StringField(max_length=20)
    email = db.EmailField()
    telefono = db.StringField(max_length=20)
    nombre_usuario = db.StringField(max_length=50, unique=True)
    password = db.StringField(max_length=255)
    matricula = db.StringField(max_length=20)
    institucion = db.ReferenceField(Institucion)
    grado = db.ReferenceField(Grado)
    imagen = db.StringField(default="default")
    activo = db.BooleanField(default=True)
    primera_vez = db.BooleanField(default = True)
    meta = {'strict': False}

    def __str__(self):
        return self.nombres

    def to_dict(self, full=True):
        institucion = ""
        grado = ""
        data ={
            "id": str(self.id),
            "nombre_completo": "%s %s %s" % (self.nombres, self.apellido_paterno, self.apellido_materno),
            "nombre_usuario": self.nombre_usuario,
        }
        if not full:
            return data
        if self.institucion != None:
            institucion = self.institucion.to_dict()
        if self.grado != None:
            grado = self.grado.to_dict()
        data.update({
            "nombres": self.nombres,
            "apellido_paterno": self.apellido_paterno,
            "apellido_materno": self.apellido_materno,
            "email": self.email,
            "telefono": self.telefono,
            "matricula": self.matricula,
            "grado": grado,
            "imagen": self.imagen,
            "activo": self.activo,
            "primera_vez": self.primera_vez,
            "institucion": institucion
        })
        return data

    def encrypt_password(self, password_to_encrypt):
    	self.password = generate_password_hash(password_to_encrypt)

    def check_password(self, password_to_check):
        return check_password_hash(self.password, str(password_to_check).strip())
    
    @classmethod
    def get_by_email_or_username(cls, email_or_usernmane):
        text_id = email_or_usernmane.lower()
        if '@' in text_id:
            return cls.objects.filter(email=text_id).first()
        return cls.objects.filter(username=text_id).first()

    @classmethod
    def get_by_id(cls, user_id):
        return cls.objects(id=user_id).first()
    
    # token alive 10 hours
    def get_token(self, seconds_live=36000):
        token = Serializer(current_app.config.get("SECRET_KEY"),
                           expires_in=seconds_live)
        return str(token.dumps({'id': str(self.id)}))

    @classmethod
    def load_from_token(cls, token):
        s = Serializer(current_app.config.get("SECRET_KEY"))
        if token[0:2] == "b'" and token[-1:] == "'":
            token = token[2:-1]
        try:
            data = s.loads(token)
            return cls.get_by_id(data['id'])
        except SignatureExpired:
            print("firma vencida")
            # the token has ben expired
            return None
        except BadSignature:
            print("token invalido")
            # the token ist'n valid
            return None
        return None
