import random
import string
import pytest

def random_string(length=10):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

@pytest.fixture
def admin_token(client):
    # Log in using the pre-created test admin user
    email = "test_admin@store.com"
    password = "Password123!"
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200
    return login_res.json()["access_token"]

def test_store_and_layout_flow(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Create a store
    store_name = f"Store_{random_string(5)}"
    create_res = client.post("/api/stores", headers=headers, json={
        "name": store_name,
        "location": "Main Street 45",
        "width": 25.0,
        "height": 12.0
    })
    assert create_res.status_code == 201
    store_data = create_res.json()
    store_id = store_data["id"]
    assert store_data["name"] == store_name
    
    # 2. Save store layout (Zones and Shelves)
    save_res = client.post(f"/api/stores/{store_id}/layout", headers=headers, json={
        "zones": [
            {
                "name": "Produce Section",
                "x_min": 0.0,
                "y_min": 0.0,
                "x_max": 6.0,
                "y_max": 12.0
            }
        ],
        "shelves": [
            {
                "zone_name": "Produce Section",
                "name": "Apple Shelf A",
                "x_min": 1.0,
                "y_min": 1.0,
                "x_max": 5.0,
                "y_max": 2.5,
                "layers": 4
            }
        ]
    })
    assert save_res.status_code == 200
    assert save_res.json()["status"] == "success"
    
    # 3. Retrieve store layout and verify values
    get_res = client.get(f"/api/stores/{store_id}/layout", headers=headers)
    assert get_res.status_code == 200
    layout_data = get_res.json()
    assert layout_data["store_id"] == store_id
    assert len(layout_data["zones"]) == 1
    assert layout_data["zones"][0]["name"] == "Produce Section"
    assert len(layout_data["shelves"]) == 1
    assert layout_data["shelves"][0]["name"] == "Apple Shelf A"
    assert layout_data["shelves"][0]["layers"] == 4
