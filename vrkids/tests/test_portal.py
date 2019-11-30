import os
import tempfile
import json
import pytest

from flaskr import api
from models.portal import Portal

@pytest.fixture
def client():
    db_fd, api.app.config['DATABASE'] = tempfile.mkstemp()
    api.app.config['TESTING'] = True
    client = api.app.test_client()

    yield client

    os.close(db_fd)
    os.unlink(api.app.config['DATABASE'])

def test_get_portal(client):
	rv = client.get('/portales')
	if rv._status_code == 200:
		return True
	assert False

def test_get_portal_id(client):
	portal = newPortal()
	if(portal==None):
		assert False
	rv = client.get('/portales/'+str(portal.id))
	if rv._status_code == 200:
		return True
	assert False

def newPortal():
	portal = Portal()
	portal.titulo = 'titulo'
	portal.save()
	return portal