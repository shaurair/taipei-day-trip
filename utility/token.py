import os
from dotenv import load_dotenv
import jwt

load_dotenv()
jwt_secret_key = os.getenv("JWT_SECRET_KEY")

def token_encode(payload):
    return jwt.encode(payload, jwt_secret_key, algorithm='HS256')

def token_decode(token):
    return jwt.decode(token, jwt_secret_key, algorithms="HS256")