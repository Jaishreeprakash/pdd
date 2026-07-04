import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL

# Fix legacy postgres:// scheme (Render/Heroku style)
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

is_sqlite = db_url.startswith("sqlite")

if is_sqlite:
    connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args)
else:
    # PostgreSQL — add SSL and pool settings suitable for cloud deployments
    engine = create_engine(
        db_url,
        pool_pre_ping=True,          # detects stale connections
        pool_recycle=300,            # recycle connections every 5 min
        pool_size=5,
        max_overflow=10,
        connect_args={"sslmode": "require"} if "sslmode" not in db_url else {},
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
