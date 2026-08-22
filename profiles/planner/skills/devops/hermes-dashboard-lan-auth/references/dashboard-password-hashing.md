# Dashboard password hashing (safe recipe)

The basic auth provider stores a scrypt hash, not the plaintext. Hashing a
password that contains shell metacharacters (especially `$`) by interpolating
it into `python -c "hash_password('...')"` corrupts the value and causes a
silent login failure. Always pass the password through an environment variable.

## Hash a password (safe — no shell interpolation)
```bash
cd ${HOME}/.hermes/hermes-agent
PW='J1234osh$' venv/bin/python -c \
  "from plugins.dashboard_auth.basic import hash_password, os; print(hash_password(os.environ['PW']))"
```

## Store it
```bash
venv/bin/python -m hermes_cli.main config set dashboard.basic_auth.username josh434
venv/bin/python -m hermes_cli.main config set dashboard.basic_auth.password_hash "<hash above>"
venv/bin/python -m hermes_cli.main plugins enable basic   # required; not enabled by default
```

## Verify the stored hash actually matches (do this BEFORE declaring login fixed)
```python
import hashlib, base64, hmac
def verify(password, encoded):
    scheme, n_s, r_s, p_s, salt_b64, dk_b64 = encoded.split("$")
    salt = base64.b64decode(salt_b64); expected = base64.b64decode(dk_b64)
    actual = hashlib.scrypt(password.encode(), salt=salt, n=int(n_s), r=int(r_s),
                            p=int(p_s), dklen=len(expected))
    return hmac.compare_digest(actual, expected)
stored = "<password_hash from config>"
print("matches:", verify("J1234osh$", stored))   # expect True
print("wrong   :", verify("WRONG", stored))        # expect False
```

## End-to-end login test (proves the form flow, not just the hash)
GET `/auth/login` (sets CSRF cookie) then POST JSON to `/auth/password-login`:
`{"provider":"basic","username":...,"password":...,"next":""}`.
Expect `200 {"ok":true}` + `hermes_session_*` cookies. Wrong password → `401`.
Do NOT use `curl -u` — the provider is a login form, not HTTP Basic Auth.
