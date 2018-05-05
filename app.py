import uuid
import random
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
    id = uuid.uuid4().hex
    session['id'] = id
    if random.random() < TRADER_PROB:
        session['type'] = 'trader'
        return redirect(url_for('trader'))
    else:
        session['type'] = 'basket'
        return redirect(url_for('basket'))


@app.route('/basket')
def basket():
    return render_template('basket.html')


@app.route('/trader')
def trader():
    return render_template('trader.html')


if __name__ == '__main__':
    app.run(debug=True)
