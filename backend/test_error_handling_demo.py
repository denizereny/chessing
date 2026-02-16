#!/usr/bin/env python3
"""
Demo script to test the error handling system
"""
import requests
import json
import sys

def test_error_handling():
    """Test the error handling system with various scenarios"""
    base_url = "http://localhost:5000/api"
    
    print("🧪 Testing Flask Chess Backend Error Handling System")
    print("=" * 60)
    
    # Test 1: Health check (should work)
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Validation error - invalid AI difficulty
    print("\n2. Testing validation error (invalid AI difficulty)...")
    try:
        response = requests.post(f"{base_url}/game/new", 
                               json={'ai_difficulty': 5, 'player_color': 'white'})
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Session not found error
    print("\n3. Testing session not found error...")
    try:
        response = requests.post(f"{base_url}/game/invalid-session/move",
                               json={'from_position': [0, 0], 'to_position': [1, 0]})
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 4: Invalid move error
    print("\n4. Testing invalid move error...")
    try:
        # First create a game
        response = requests.post(f"{base_url}/game/new", json={})
        if response.status_code == 200:
            session_id = response.json()['session_id']
            
            # Try to make an invalid move (moving empty square)
            response = requests.post(f"{base_url}/game/{session_id}/move",
                                   json={'from_position': [2, 2], 'to_position': [3, 2]})
            print(f"   Status: {response.status_code}")
            print(f"   Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"   Failed to create game: {response.status_code}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 5: Not AI turn error
    print("\n5. Testing not AI turn error...")
    try:
        # Create a game where player is white (AI is black)
        response = requests.post(f"{base_url}/game/new", 
                               json={'player_color': 'white'})
        if response.status_code == 200:
            session_id = response.json()['session_id']
            
            # Try to request AI move when it's white's turn (player's turn)
            response = requests.post(f"{base_url}/game/{session_id}/ai-move")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"   Failed to create game: {response.status_code}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 6: 404 Not Found
    print("\n6. Testing 404 not found error...")
    try:
        response = requests.get(f"{base_url}/nonexistent")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Error handling system test completed!")
    print("\nKey features demonstrated:")
    print("- Consistent JSON error format with error_code, message, details, timestamp, path")
    print("- Specific error types (ValidationError, SessionError, InvalidMoveError, NotAITurnError)")
    print("- Appropriate HTTP status codes (400, 404, 500)")
    print("- Detailed error information for debugging")
    print("- Structured logging of errors")

if __name__ == "__main__":
    print("Note: This script requires the Flask server to be running on localhost:5000")
    print("Start the server with: python run.py")
    print("Press Enter to continue or Ctrl+C to exit...")
    try:
        input()
        test_error_handling()
    except KeyboardInterrupt:
        print("\nTest cancelled.")
        sys.exit(0)