import pytest

def test_login_and_profile_flow(client):
    email = "test_admin@store.com"
    password = "Password123!"
    
    # 1. Login user
    login_response = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == email
    assert login_data["user"]["role"] == "Admin"
    
    # 2. Retrieve profile with JWT
    token = login_data["access_token"]
    profile_response = client.get("/api/auth/profile", headers={
        "Authorization": f"Bearer {token}"
    })
    assert profile_response.status_code == 200
    profile_data = profile_response.json()
    assert profile_data["email"] == email
    assert profile_data["role"] == "Admin"
