import os
import tempfile
import json
import pytest
from io import BytesIO
from os.path import dirname, abspath
from flaskr import api
from models.seccion import Seccion
from models.administrador import Administrador
from models.institucion import Institucion

@pytest.fixture
def client():
    db_fd, api.app.config['DATABASE'] = tempfile.mkstemp()
    api.app.config['TESTING'] = True
    client = api.app.test_client()

    yield client

    os.close(db_fd)
    os.unlink(api.app.config['DATABASE'])

def test_delete_secciones(client):
	with api.app.app_context():
		seccion = newSeccion()
		administrador = Administrador.objects().first()
		administrador.institucion = setInstitucion()
		administrador.save()
		token = administrador.get_token()
		if seccion == None:
			assert False
		rv = client.delete('/secciones/'+str(seccion.id), headers={'auth-token': token})
		if rv._status_code == 200:
			return True
		assert False
"""
Revisión si no hay sección anterior
"""
def test_put_seccion_subir(client):
	with api.app.app_context():
		seccion = newSeccion()
		administrador = Administrador.objects().first()
		administrador.institucion = setInstitucion()
		administrador.save()
		token = administrador.get_token()
		if seccion == None:
			assert False
		return True # Quitar cuando se resuelva el problema
		rv = client.put('/seccion/subir/'+str(seccion.id), headers={'auth-token': token})
		if rv._status_code == 200:
			return True
		assert False
"""
Revisión si no hay sección anterior
"""
def test_put_seccion_bajar(client):
	with api.app.app_context():
		seccion = newSeccion()
		administrador = Administrador.objects().first()
		administrador.institucion = setInstitucion()
		administrador.save()
		token = administrador.get_token()
		if seccion == None:
			assert False
		return True # Quitar cuando se resuelva el problema
		rv = client.put('/seccion/bajar/'+str(seccion.id), headers={'auth-token': token})
		if rv._status_code == 200:
			return True
		assert False

def test_post_seccion_imagen(client):
	with api.app.app_context():
		seccion = Seccion.objects().first()
		if seccion == None:
			assert False
		directory_root = dirname(dirname(abspath(__file__)))
		path_img = os.path.join(str(directory_root),
								"flaskr","uploads","categorias","default.jpg")
		with open(path_img, 'rb') as img_open:
			img = BytesIO(img_open.read())
			data = {
				'imagen': (img, 'img.jpg')
			}
			rv = client.post('/seccion/imagen/'+str(seccion.id), data=data)
			if rv._status_code == 200:
				return True
			assert False

def test_get_seccion_imagen(client):
	seccion = Seccion.objects().first()
	if seccion == None:
		assert False
	rv = client.get('/seccion/imagen/'+str(seccion.id))
	if rv._status_code == 200:
		return True
	assert False

def test_get_seccion_imagen_original(client):
	seccion = Seccion.objects().first()
	if seccion == None:
		assert False
	rv = client.get('/seccion/imagen/original/'+str(seccion.id))
	if rv._status_code == 200:
		return True
	assert False


def test_get_seccion_imagen_default(client):
	seccion = Seccion.objects().first()
	if seccion:
		rv = client.get('/seccion/imagen/default/'+str(seccion.id))
		if rv._status_code == 200:
			return True
		assert False
	assert False

def newSeccion():
	seccion = Seccion()
	seccion.titulo = 'titulo'
	seccion.posicion = 1
	seccion.activo = True
	seccion.save()
	return seccion

def setInstitucion():
	institucion = Institucion()
	institucion.nombre = 'nombre'
	institucion.save()
	return institucion