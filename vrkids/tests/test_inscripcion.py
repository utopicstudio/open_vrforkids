import os
import tempfile
import json
import pytest

from flaskr import api
from models.inscripcion import Inscripcion
from models.alumno import Alumno
from models.profesor import Profesor
from models.curso import Curso
from models.historial import Historial

@pytest.fixture
def client():
    db_fd, api.app.config['DATABASE'] = tempfile.mkstemp()
    api.app.config['TESTING'] = True
    client = api.app.test_client()

    yield client

    os.close(db_fd)
    os.unlink(api.app.config['DATABASE'])

def test_get_inscripcion_item(client):
	inscripcion = newInscripcion()
	if inscripcion == None:
		assert False
	rv = client.get('/inscripciones/'+str(inscripcion.id))
	if rv._status_code == 200:
		return True
	assert False

def test_delete_inscripcion_item(client):
	inscripcion = newInscripcion()
	if inscripcion == None:
		assert False
	rv = client.delete('/inscripciones/'+str(inscripcion.id))
	if rv._status_code == 200:
		return True
	assert False

def test_put_inscripcion_item(client):
	inscripcion = newInscripcion()
	if inscripcion == None:
		assert False
	data = {
		'estado': 'ENVIADA',
		'mensaje': 'mensaje'
	}
	data = json.dumps(data)
	data = data.encode()
	rv = client.put('/inscripciones/'+str(inscripcion.id), data=data)
	if rv._status_code == 200:
		return True
	assert False

def test_post_inscripciones_aceptar(client):
	recurso = newCursoProfesor()
	if recurso == None:
		assert False
	rv = client.post('/aceptar/inscripciones/recurso/'+str(recurso.id))
	if rv._status_code == 200:
		return True
	assert False

def test_get_inscripcion_recurso(client):
	recurso = Curso.objects().first()
	if recurso == None:
		assert False
	rv = client.get('/inscripciones/recurso/'+str(recurso.id))
	if rv._status_code == 200:
		return True
	assert False

def test_post_inscripcion_recurso(client):
	recurso = Curso.objects().first()
	alumno = Alumno.objects().first()
	if recurso == None or alumno == None:
		assert False
	data = {
		'id_alumno': str(alumno.id)
	}
	data = json.dumps(data)
	data = data.encode()
	rv = client.post('/inscripciones/recurso/'+str(recurso.id), data=data)
	if rv._status_code == 200:
		return True
	assert False

def test_get_inscripciones_alumno(client):
	inscripcion = Inscripcion.objects().first()
	if inscripcion == None:
		assert False
	rv = client.get('/inscripciones/alumno/'+str(inscripcion.id))
	if rv._status_code == 200:
		return True
	assert False

def test_get_inscripciones(client):
	rv = client.get('/inscripciones')
	if rv._status_code == 200:
		return True
	assert False

def newInscripcion():
	alumno = Alumno.objects().first()
	inscripcion = Inscripcion()
	inscripcion.alumno
	inscripcion.save()
	return inscripcion

def newCursoProfesor():
	curso = Curso.objects().first()
	profesor = Profesor()
	profesor.nombres = 'nombre'
	profesor.apellido_paterno = 'apellido_paterno'
	profesor.apellido_materno = 'apellido_materno'
	profesor.save()
	curso.profesor = profesor
	curso.save()
	return curso

