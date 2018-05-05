import json
from sqlalchemy import create_engine
from sqlalchemy import Column, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine('sqlite:///game.db')
Base = declarative_base()
session = sessionmaker(bind=engine)()


class Game(Base):
    __tablename__ = 'game'

    id = Column(String, primary_key=True)
    state = Column(String)

    def __init__(self, id, state):
        self.id = id
        self.state = state


def save(id, state):
    state = json.dumps(state)
    game = session.query(Game).filter(Game.id == id).first()
    if game is None:
        game = Game(id, state)
    else:
        game.state = state
    session.add(game)
    session.commit()


def load(id):
    game = session.query(Game).filter(Game.id == id).first()
    if game is None:
        return None
    return json.loads(game.state)


Base.metadata.create_all(engine)