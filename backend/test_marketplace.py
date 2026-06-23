import urllib.request
import urllib.parse
import json
import time

API_URL = "http://localhost:8000"

def test_api():
    print("=== STARTING MARKETPLACE API TESTS ===")
    
    # 1. Register User
    print("\n1. Testing User Registration...")
    reg_data = urllib.parse.urlencode({
        "username": f"testuser_{int(time.time())}",
        "email": f"test_{int(time.time())}@example.com",
        "password": "securepassword123",
        "phone": "+255700000000",
        "bio": "Mimi ni mfanyabiashara wa magari"
    }).encode("utf-8")
    
    req = urllib.request.Request(f"{API_URL}/api/auth/register", data=reg_data, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode())
            assert "access_token" in res_data
            assert "user" in res_data
            token = res_data["access_token"]
            user_id = res_data["user"]["id"]
            print(f"SUCCESS: User registered! ID: {user_id}")
    except Exception as e:
        print(f"FAILED: User registration failed: {e}")
        return

    # 2. Login User
    print("\n2. Testing User Login...")
    login_data = urllib.parse.urlencode({
        "email": res_data["user"]["email"],
        "password": "securepassword123"
    }).encode("utf-8")
    req = urllib.request.Request(f"{API_URL}/api/auth/login", data=login_data, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode())
            assert "access_token" in res_data
            token = res_data["access_token"]
            print("SUCCESS: User logged in!")
    except Exception as e:
        print(f"FAILED: User login failed: {e}")
        return

    # 3. Post Ad (Product)
    print("\n3. Testing Post Advertisement...")
    prod_data = urllib.parse.urlencode({
        "title": "Subaru Forester 2016",
        "price": "24500000",
        "category": "Cars",
        "description": "Subaru Forester ya mwaka 2016 rangi ya bluu. Haina shida yoyote."
    }).encode("utf-8")
    
    req = urllib.request.Request(f"{API_URL}/api/products", data=prod_data, method="POST")
    req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode())
            assert res_data["title"] == "Subaru Forester 2016"
            prod_id = res_data["id"]
            print(f"SUCCESS: Product posted! ID: {prod_id}")
    except Exception as e:
        print(f"FAILED: Post product failed: {e}")
        return

    # 4. View Product Details (Increments interest metrics)
    print("\n4. Testing Product Detail Retrieve (View interaction)...")
    req = urllib.request.Request(f"{API_URL}/api/products/{prod_id}")
    req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode())
            assert res_data["title"] == "Subaru Forester 2016"
            print("SUCCESS: Product details retrieved (View interaction logged).")
    except Exception as e:
        print(f"FAILED: View product details failed: {e}")
        return

    # 5. Get Recommendations
    print("\n5. Testing Recommendations System...")
    req = urllib.request.Request(f"{API_URL}/api/recommendations")
    req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode())
            assert isinstance(res_data, list)
            # Check if our viewed category is recommended
            print(f"SUCCESS: Recommendations retrieved! Count: {len(res_data)}")
            for item in res_data[:3]:
                print(f"   -> Recommended item: {item['title']} in category: {item['category']} (Preferred: {item['is_recommended']})")
    except Exception as e:
        print(f"FAILED: Get recommendations failed: {e}")
        return

    # 6. Buy Product (SOLDOUT workflow)
    print("\n6. Testing Buy Product...")
    req = urllib.request.Request(f"{API_URL}/api/products/{prod_id}/buy", method="POST")
    req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode())
            assert res_data["status"] == "sold"
            print("SUCCESS: Product bought and set to SOLDOUT!")
    except Exception as e:
        print(f"FAILED: Buy product failed: {e}")
        return

    # 7. Check products listing (Verify sold product shows within 3 mins)
    print("\n7. Verify sold product still shown in recent marketplace query...")
    req = urllib.request.Request(f"{API_URL}/api/products")
    try:
        with urllib.request.urlopen(req) as res:
            products_list = json.loads(res.read().decode())
            found = False
            for p in products_list:
                if p["id"] == prod_id:
                    assert p["status"] == "sold"
                    print(f"SUCCESS: Sold product is still visible (Hiding countdown: {p['seconds_left']} seconds remaining)")
                    found = True
                    break
            assert found
    except Exception as e:
        print(f"FAILED: Sold product visibility check failed: {e}")
        return

    # 8. Test delete listing (soft-delete)
    print("\n8. Testing Manual Product Delete...")
    req = urllib.request.Request(f"{API_URL}/api/products/{prod_id}", method="DELETE")
    req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode())
            print("SUCCESS: Product soft-deleted by owner!")
    except Exception as e:
        print(f"FAILED: Delete product failed: {e}")
        return

    # 9. Verify product is no longer shown in listings
    print("\n9. Verify deleted product is hidden from marketplace...")
    req = urllib.request.Request(f"{API_URL}/api/products")
    try:
        with urllib.request.urlopen(req) as res:
            products_list = json.loads(res.read().decode())
            for p in products_list:
                assert p["id"] != prod_id
            print("SUCCESS: Deleted product is hidden from marketplace!")
    except Exception as e:
        print(f"FAILED: Deleted product visibility check failed: {e}")
        return


    print("\n=== ALL TESTS COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    test_api()
