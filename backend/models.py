from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    products = relationship("Product", back_populates="owner")
    interactions = relationship("UserInteraction", back_populates="user")

class Product(Base):
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False) # e.g. Houses, Cars, Livestock, Clothes, Shoes, General
    price = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=True)
    status = Column(String(20), default="active") # active, sold, deleted, expired
    owner_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    sold_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    
    owner = relationship("User", back_populates="products")
    interactions = relationship("UserInteraction", back_populates="product")

class UserInteraction(Base):
    __tablename__ = 'user_interactions'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True) # None for guests
    product_id = Column(Integer, ForeignKey('products.id'))
    interaction_type = Column(String(20)) # view, buy, click
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="interactions")
    product = relationship("Product", back_populates="interactions")
