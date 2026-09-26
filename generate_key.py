from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
).decode('utf-8')

# Read backend/.env
with open('backend/.env', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('backend/.env', 'w', encoding='utf-8') as f:
    for line in lines:
        if line.startswith('JWT_PRIVATE_KEY='):
            f.write('JWT_PRIVATE_KEY="' + pem.replace('\n', '\\n') + '"\n')
        else:
            f.write(line)
print("Updated .env with a real RSA key.")
