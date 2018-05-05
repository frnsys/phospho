from flask import Blueprint, session, jsonify, abort

bp = Blueprint('api', __name__)


@bp.route('/trades')
def trades():
    """get status on trades for the current user"""
    id = session.get('id')
    if id is None:
        abort(401)
    # TODO
    return jsonify()


@bp.route('/trades/buy', methods=['POST'])
def trade_buy():
    """submit bid to buy shares"""
    id = session.get('id')
    if id is None:
        abort(401)
    # TODO
    return jsonify()


@bp.route('/trades/sell', methods=['POST'])
def trade_sell():
    """put shares up for sale"""
    id = session.get('id')
    if id is None:
        abort(401)
    # TODO
    return jsonify()


@bp.route('/prices')
def prices():
    """get prices of basket goods"""
    id = session.get('id')
    if id is None:
        abort(401)
    # TODO
    return jsonify()
