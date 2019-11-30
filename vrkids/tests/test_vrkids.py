import os
import tempfile
import json
import pytest
import random
import string

from io import BytesIO
from os.path import dirname, abspath
from flaskr import api
from models.administrador import Administrador
from models.alumno import Alumno
from models.curso import Curso
from models.pregunta import Pregunta
from models.institucion import Institucion

@pytest.fixture
def client():
    db_fd, api.app.config['DATABASE'] = tempfile.mkstemp()
    api.app.config['TESTING'] = True
    client = api.app.test_client()

    yield client

    os.close(db_fd)
    os.unlink(api.app.config['DATABASE'])

def test_get_recurso_cargar(client):
    with api.app.app_context():
        administrador = Administrador.objects().first()
        administrador.institucion = setInstitucion()
        administrador.save()
        token = administrador.get_token()
        recurso = Curso.objects().first()
        if recurso == None:
            assert False
        rv = client.get('/recursos/'+str(recurso.id), headers={'auth-token': token})
        if rv._status_code == 200:
            return True
        assert False

def test_put_curso_evaluacion_alumno(client):
    with api.app.app_context():
        recurso = Curso.objects().first()
        alumno = Alumno.objects().first()
        if recurso == None or alumno == None:
            assert False
        data = {
            'respuesta': [1,2,3],
            'progreso': 1
        }
        token = alumno.get_token()
        data = json.dumps(data)
        data = data.encode()
        rv = client.put('/recursos/'+str(recurso.id)+'/respuestas',
                        data=data, headers={'auth-token': token})
        if rv._status_code == 200:
            return True
        assert False
                
def test_get_pregunta_imagen(client):
    recurso = Curso.objects().first()
    if recurso == None:
        assert True
    else:
        rv = client.get('/preguntas/'+str(recurso.id))
        if rv._status_code == 200:
            assert True
        else:
            assert False

def test_post_pregunta_imagen(client):
    with api.app.app_context():
        directory_root = dirname(dirname(abspath(__file__)))
        path_img = os.path.join(str(directory_root),
                                "flaskr","uploads","preguntas","default.jpg")
        with open(path_img, 'rb') as img_open:
            img = BytesIO(img_open.read())
            recurso = Curso.objects().first()
            if recurso == None:
                assert False
            data = {
                'imagen': (img, 'img.jpg')
            }
            rv = client.post('/preguntas/'+str(recurso.id), content_type='multipart/form-data', data=data)
            if rv._status_code == 200:
                return True
            assert False

def setInstitucion():
	institucion = Institucion()
	institucion.nombre = 'nombre'
	institucion.save()
	return institucion