import os
import tempfile
import json
import pytest

from models.administrador import Administrador
from flaskr import api

@pytest.fixture
def client():
    db_fd, api.app.config['DATABASE'] = tempfile.mkstemp()
    api.app.config['TESTING'] = True
    client = api.app.test_client()

    yield client

    os.close(db_fd)
    os.unlink(api.app.config['DATABASE'])

def test_post_login(client):
	newUserLogin()
	with api.app.app_context():
		data = dict(tipo='ADMINISTRADOR', email='admin@admin.cl', password='pass')
		data = json.dumps(data)
		rv = client.post('/login',content_type='application/json', data=data)
		if rv._status_code == 200:
			return True
		assert False

def test_post_logout(client):
	rv = client.post('/logout')
	if rv._status_code == 200:
		return True
	assert False

def test_post_login_app(client):
	data = dict(tipo='ADMINISTRADOR', email='admin@admin.cl', password='pass')
	data = json.dumps(data)
	rv = client.post('/login/app', content_type='application/json', data=data)
	if rv._status_code == 200:
		return True
	assert False

def newUserLogin():
	administrador = Administrador()
	administrador.email = "admin@admin.cl"
	administrador.activo = True
	administrador.encrypt_password("pass")
	administrador.save()
