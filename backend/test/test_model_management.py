"""
Test script for model management system
Test database operations, API calls, and model/provider management
"""
import sys
sys.path.insert(0, '/d/code/picturev1/backend')

from app.database import Database
from app.config import DB_CONFIG
from app.services.model_service import ModelService, ModelAPIKeyManager, ModelConfigManager, ProviderManager
from app.utils.id_generator import generate_id
import json


def test_database_connection():
    """Test database connection"""
    print("\n=== Testing Database Connection ===")
    db = Database()
    try:
        db.init_pool(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            database=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            min_conn=1,
            max_conn=5
        )
        print("✅ Database connected successfully")
        db.close_pool()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


def test_provider_operations():
    """Test provider management"""
    print("\n=== Testing Provider Operations ===")
    try:
        # Get all providers
        providers = ProviderManager.get_all_providers()
        print(f"✅ Found {len(providers)} providers:")
        for p in providers:
            print(f"   - {p['display_name']} ({p['name']})")
        
        # Get specific provider
        if providers:
            provider = ProviderManager.get_provider_by_id(providers[0]['id'])
            print(f"✅ Retrieved provider: {provider['display_name']}")
            return True
    except Exception as e:
        print(f"❌ Provider operations failed: {e}")
        return False


def test_model_operations():
    """Test model management"""
    print("\n=== Testing Model Operations ===")
    try:
        # Get all models
        models = ModelService.get_all_models(active_only=True)
        print(f"✅ Found {len(models)} active models:")
        for m in models:
            print(f"   - {m['display_name']} (Provider: {m['provider_display_name']})")
        
        # Get model by name
        if models:
            model_name = models[0]['model_name']
            model = ModelService.get_model_by_name(model_name)
            print(f"✅ Retrieved model by name: {model['display_name']}")
            
            # Get model by ID
            model_by_id = ModelService.get_model_by_id(model['id'])
            print(f"✅ Retrieved model by ID: {model_by_id['display_name']}")
            return True
    except Exception as e:
        print(f"❌ Model operations failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_api_key_management():
    """Test API key management"""
    print("\n=== Testing API Key Management ===")
    try:
        # Get a model
        models = ModelService.get_all_models(active_only=True)
        if not models:
            print("⚠️ No models available")
            return False
        
        model = models[0]
        model_id = model['id']
        
        # Create API key
        test_key = f"test_key_{generate_id()}"
        key_id = ModelAPIKeyManager.create_api_key(
            model_id=model_id,
            api_key=test_key,
            quota_limit=1000
        )
        print(f"✅ Created API key: {key_id}")
        
        # Get active key
        active_key = ModelAPIKeyManager.get_active_key(model_id)
        if active_key:
            print(f"✅ Retrieved active API key for model")
            
            # Update quota
            ModelAPIKeyManager.update_quota_used(active_key['id'], 10)
            print(f"✅ Updated quota usage")
            
            # Deactivate key
            ModelAPIKeyManager.deactivate_key(active_key['id'])
            print(f"✅ Deactivated API key")
        
        return True
    except Exception as e:
        print(f"❌ API key management failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_config_management():
    """Test model configuration management"""
    print("\n=== Testing Configuration Management ===")
    try:
        # Get a model
        models = ModelService.get_all_models(active_only=True)
        if not models:
            print("⚠️ No models available")
            return False
        
        model_id = models[0]['id']
        
        # Set configuration
        config_id = ModelConfigManager.set_config(
            model_id=model_id,
            config_key="pricing",
            config_value={"per_image": 0.02, "currency": "USD"},
            description="Model pricing configuration"
        )
        print(f"✅ Created configuration: {config_id}")
        
        # Get configuration
        config = ModelConfigManager.get_config(model_id, "pricing")
        if config:
            print(f"✅ Retrieved configuration: {config['config_key']}")
            print(f"   Value: {json.dumps(config['config_value'], indent=2)}")
        
        # Get all configurations
        all_configs = ModelConfigManager.get_all_configs(model_id)
        print(f"✅ Found {len(all_configs)} configurations for model")
        
        return True
    except Exception as e:
        print(f"❌ Configuration management failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def run_all_tests():
    """Run all tests"""
    print("=" * 50)
    print("Starting Model Management System Tests")
    print("=" * 50)
    
    results = {
        "Database Connection": test_database_connection(),
        "Provider Operations": test_provider_operations(),
        "Model Operations": test_model_operations(),
        "API Key Management": test_api_key_management(),
        "Configuration Management": test_config_management(),
    }
    
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 50)
    
    return passed == total


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
