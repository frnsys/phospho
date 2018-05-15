import uuid
from api import bp
from flask_webpack import Webpack
from flask import Flask, redirect, url_for, render_template, session

TRADER_PROB = 0.2

app = Flask(__name__)
app.register_blueprint(bp)
app.config['SECRET_KEY'] = 'phosphate'
app.config['WEBPACK_MANIFEST_PATH'] = 'static/manifest.json'
Webpack(app)

@app.route('/')
def new_game():
    id = session.get('id')
    if id is None:
        id = uuid.uuid4().hex
        session['id'] = id
    return redirect(url_for('main', id=id))


@app.route('/<id>')
def main(id):
    return render_template('main.html')


@app.route('/basket')
def basket():
    return render_template('basket.html')


@app.route('/trader')
def trader():
    return render_template('trader.html')


if __name__ == '__main__':
    app.run(debug=True)
