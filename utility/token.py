import jwt

jwt_secret_key = 'my_taipei_trip'

def token_encode(payload):
    return jwt.encode(payload, jwt_secret_key, algorithm='HS256')

def token_decode(token):
    return jwt.decode(token, jwt_secret_key, algorithms="HS256")