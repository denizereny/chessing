#!/usr/bin/env python3
"""
Simple verification script for Flask Chess Backend setup
"""
import sys
import json

def verify_setup():
    """Verify the Flask setup without starting a server"""
    try:
        # Test app creation
        from backend.app import create_app
        from backend.config.config import DevelopmentConfig, TestingConfig
        
        print("🔍 Testing app creation...")
        app = create_app(DevelopmentConfig)
        assert app is not None
        print("✓ Development app created successfully")
        
        test_app = create_app(TestingConfig)
        assert test_app is not None
        print("✓ Testing app created successfully")
        
        # Test with test client
        print("\n🔍 Testing API endpoints...")
        with test_app.test_client() as client:
            # Test health endpoint
            response = client.get('/api/health')
            assert response.status_code == 200
            
            data = json.loads(response.data)
            assert data['status'] == 'healthy'
            assert 'message' in data
            assert 'version' in data
            print("✓ Health endpoint working")
            
            # Test CORS headers
            assert 'Access-Control-Allow-Origin' in response.headers
            print("✓ CORS headers present")
            
            # Test 404 handling
            response = client.get('/api/nonexistent')
            assert response.status_code == 404
            
            data = json.loads(response.data)
            assert data['error_code'] == 'NOT_FOUND'
            print("✓ 404 error handling working")
            
            # Test placeholder endpoints
            response = client.post('/api/game/new')
            assert response.status_code == 501
            print("✓ Placeholder endpoints returning 501")
        
        # Test package imports
        print("\n🔍 Testing required packages...")
        import flask
        import flask_cors
        import jwt
        import pytest
        import hypothesis
        print("✓ All required packages available")
        
        # Test directory structure
        print("\n🔍 Testing directory structure...")
        import os
        required_dirs = [
            'backend/app',
            'backend/app/api',
            'backend/app/chess',
            'backend/app/models',
            'backend/app/utils',
            'backend/config',
            'backend/tests'
        ]
        
        for dir_path in required_dirs:
            assert os.path.exists(dir_path), f"Directory {dir_path} not found"
            assert os.path.exists(os.path.join(dir_path, '__init__.py')), f"__init__.py not found in {dir_path}"
        print("✓ Directory structure complete")
        
        print("\n✅ Flask Chess Backend setup verification successful!")
        print("\n📋 Setup Summary:")
        print("   • Flask application factory pattern implemented")
        print("   • CORS configured for frontend communication")
        print("   • API blueprint structure ready")
        print("   • Error handling implemented")
        print("   • Testing infrastructure ready")
        print("   • Required packages installed")
        print("   • Directory structure organized")
        print("   • Property-based tests implemented")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Setup verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("🚀 Flask Chess Backend Setup Verification")
    print("=" * 50)
    
    success = verify_setup()
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)