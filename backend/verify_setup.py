#!/usr/bin/env python3
"""
Verification script for Flask Chess Backend setup
"""
import sys
import requests
import time
import subprocess
import signal
import os
from multiprocessing import Process

def start_server():
    """Start the Flask development server"""
    os.environ['FLASK_CONFIG'] = 'development'
    from backend.run import app
    app.run(host='127.0.0.1', port=5001, debug=False)

def test_server():
    """Test the running server"""
    base_url = 'http://127.0.0.1:5001'
    
    # Wait for server to start
    time.sleep(2)
    
    try:
        # Test health endpoint
        response = requests.get(f'{base_url}/api/health', timeout=5)
        assert response.status_code == 200
        
        data = response.json()
        assert data['status'] == 'healthy'
        print("✓ Health endpoint working")
        
        # Test CORS headers
        assert 'Access-Control-Allow-Origin' in response.headers
        print("✓ CORS headers present")
        
        # Test 404 handling
        response = requests.get(f'{base_url}/api/nonexistent', timeout=5)
        assert response.status_code == 404
        
        data = response.json()
        assert data['error_code'] == 'NOT_FOUND'
        print("✓ 404 error handling working")
        
        print("\n✅ Flask Chess Backend setup verification successful!")
        return True
        
    except Exception as e:
        print(f"\n❌ Server test failed: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Starting Flask Chess Backend verification...")
    
    # Start server in a separate process
    server_process = Process(target=start_server)
    server_process.start()
    
    try:
        # Test the server
        success = test_server()
        
        if success:
            sys.exit(0)
        else:
            sys.exit(1)
            
    finally:
        # Clean up server process
        server_process.terminate()
        server_process.join(timeout=5)
        if server_process.is_alive():
            server_process.kill()