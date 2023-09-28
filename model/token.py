import jwt

jwt_secret_key = 'my_taipei_trip'

def token_decode(token):
    return jwt.decode(token, jwt_secret_key, algorithms="HS256")