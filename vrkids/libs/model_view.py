from flask_admin.contrib.mongoengine import ModelView as MV
from datetime import datetime
from flask import redirect, url_for, abort, request
from flask_security import current_user

def date_time_formatter(view, context, model, name):
    fecha = model[name]
    return u"%s-%s-%s" % (fecha.year, fecha.month, fecha.day)

class ModelView(MV):
    can_export = False
    column_formatters = {
        'created': date_time_formatter,
        'updated': date_time_formatter
    }
    can_view_details = True
    column_labels = dict(
        created=u"Creado",
        updated=u"Editado"
    )

    def is_accessible(self):
        return current_user.is_authenticated

    def _handle_view(self, name, **kwargs):
        """
        Override builtin _handle_view in order to redirect users when a view is not accessible.
        """
        if not self.is_accessible():
            if current_user.is_authenticated:
                # permission denied
                abort(403)
            else:
                # login
                return redirect(url_for('security.login', next=request.url))


    
