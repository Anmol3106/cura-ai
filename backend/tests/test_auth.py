USER = {"email": "Test@Example.com", "password": "longenough123", "full_name": "Test"}


def signup(client):
    return client.post("/auth/signup", json=USER)


def login(client, password="longenough123"):
    return client.post(
        "/auth/login", data={"username": "test@example.com", "password": password}
    )


def test_signup_works_and_hides_password(client):
    r = signup(client)
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == "test@example.com"
    assert "password" not in body and "hashed_password" not in body


def test_duplicate_email_rejected(client):
    signup(client)
    assert signup(client).status_code == 409


def test_short_password_rejected(client):
    r = client.post("/auth/signup", json={**USER, "password": "short"})
    assert r.status_code == 422


def test_login_wrong_password(client):
    signup(client)
    assert login(client, "wrongpassword").status_code == 401


def test_login_and_me(client):
    signup(client)
    r = login(client)
    assert r.status_code == 200
    token = r.json()["access_token"]
    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "test@example.com"


def test_me_without_token(client):
    assert client.get("/auth/me").status_code == 401