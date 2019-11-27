from db import db
from models.institucion import Institucion
from werkzeug.security import generate_password_hash, check_password_hash
from flask_security import UserMixin, RoleMixin
from flask_security.utils import verify_password, hash_password
from datetime import datetime

class Role(db.Document, RoleMixin):
    name = db.StringField(max_length=80, unique=True)
    description = db.StringField(max_length=255)

    def __unicode__(self):
        return self.name

class SuperAdmin(db.Document, UserMixin):
    email = db.EmailField()
    password = db.StringField()
    active = db.BooleanField(default=True)
    confirmed_at = db.DateTimeField()
    created = db.DateTimeField(default=datetime.now)
    updated = db.DateTimeField(default=datetime.now)
    
    meta = {'strict': False}

    
    def encrypt_password(self, password_to_encrypt):
    	self.password = hash_password(password_to_encrypt)

    def check_password(self, password_to_check):
        return verify_password(self.password, str(password_to_check).strip())
