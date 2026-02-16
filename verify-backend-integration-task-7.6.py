#!/usr/bin/env python3

"""
Task 7.6: Backend Integration Verification Script

This script verifies that backend integration still works correctly
after the UI reorganization (moving controls into settings menu).

Requirement 3.5: Backend integration functionality preserved
"""

import http.client
import json
import sys

# Configuration
BACKEND_HOST = 'localhost'
BACKEND_PORT = 5000
API_BASE = '/api'

# Test results
tests_passed = 0
tests_failed = 0
test_results = []

# Colors for console output
class Colors:
    RESET = '\033[0m'
    GREEN = '\033[32m'
    RED = '\033[31m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    CYAN = '\033[36m'

def make_request(path, method='GET', data=None):
    """Make HTTP request to backend"""
    try:
        conn = http.client.HTTPConnection(BACKEND_HOST, BACKEND_PORT, timeout=10)
        
        headers = {'Content-Type': 'application/json'}
        
        # For POST requests, always send JSON body (even if empty)
        if method == 'POST':
            body = json.dumps(data if data is not None else {})
        else:
            body = json.dumps(data) if data else None
        
        conn.request(method, path, body, headers)
        response = conn.getresponse()
        
        response_data = response.read().decode('utf-8')
        
        try:
            parsed_data = json.loads(response_data)
        except json.JSONDecodeError:
            parsed_data = response_data
        
        conn.close()
        
        return {
            'success': 200 <= response.status < 300,
            'status_code': response.status,
            'data': parsed_data
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def log_test(test_name, passed, message=''):
    """Log test result"""
    global tests_passed, tests_failed
    
    status = f"{Colors.GREEN}✅ PASSED{Colors.RESET}" if passed else f"{Colors.RED}❌ FAILED{Colors.RESET}"
    print(f"\n{status}: {test_name}")
    if message:
        print(f"  {message}")
    
    test_results.append({'test_name': test_name, 'passed': passed, 'message': message})
    
    if passed:
        tests_passed += 1
    else:
        tests_failed += 1

def test_health_check():
    """Test 1: Backend Health Check"""
    print(f"\n{Colors.CYAN}Test 1: Backend Health Check{Colors.RESET}")
    print("Verifying backend API is accessible...")
    
    try:
        result = make_request(f"{API_BASE}/health")
        
        if result['success'] and result['data'].get('status') == 'healthy':
            log_test('Backend Health Check', True, f"Backend is healthy: {json.dumps(result['data'])}")
            return True
        else:
            log_test('Backend Health Check', False, f"Backend returned unhealthy status: {json.dumps(result['data'])}")
            return False
    except Exception as e:
        log_test('Backend Health Check', False, f"Backend is not accessible: {str(e)}")
        return False

def test_game_creation():
    """Test 2: Game Creation"""
    print(f"\n{Colors.CYAN}Test 2: Game Creation{Colors.RESET}")
    print("Creating a new game through backend API...")
    
    try:
        result = make_request(f"{API_BASE}/game/new", 'POST', {
            'ai_difficulty': 2,
            'player_color': 'white'
        })
        
        if result['success'] and result['data'].get('session_id'):
            session_id = result['data']['session_id']
            log_test('Game Creation', True, f"Game created with session ID: {session_id}")
            return session_id
        else:
            log_test('Game Creation', False, f"Failed to create game: {json.dumps(result['data'])}")
            return None
    except Exception as e:
        log_test('Game Creation', False, f"Error creating game: {str(e)}")
        return None

def test_custom_position_game():
    """Test 3: Custom Position Game Creation"""
    print(f"\n{Colors.CYAN}Test 3: Custom Position Game Creation{Colors.RESET}")
    print("Creating a game with custom position...")
    
    custom_board = [
        ['r', None, None, 'k'],
        [None, None, None, None],
        [None, None, None, None],
        [None, None, None, None],
        ['R', None, 'K', None]
    ]
    
    try:
        result = make_request(f"{API_BASE}/game/new", 'POST', {
            'ai_difficulty': 2,
            'player_color': 'white',
            'custom_position': custom_board
        })
        
        if result['success'] and result['data'].get('session_id'):
            session_id = result['data']['session_id']
            log_test('Custom Position Game', True, f"Custom position game created: {session_id}")
            return session_id
        else:
            log_test('Custom Position Game', False, f"Failed to create custom game: {json.dumps(result['data'])}")
            return None
    except Exception as e:
        log_test('Custom Position Game', False, f"Error creating custom game: {str(e)}")
        return None

def test_player_move(session_id):
    """Test 4: Player Move"""
    print(f"\n{Colors.CYAN}Test 4: Player Move{Colors.RESET}")
    print("Making a player move...")
    
    if not session_id:
        log_test('Player Move', False, 'No session ID available')
        return False
    
    try:
        result = make_request(f"{API_BASE}/game/{session_id}/move", 'POST', {
            'from_position': [3, 0],
            'to_position': [2, 0]
        })
        
        if result['success']:
            log_test('Player Move', True, 'Move executed successfully')
            return True
        else:
            log_test('Player Move', False, f"Move failed: {json.dumps(result['data'])}")
            return False
    except Exception as e:
        log_test('Player Move', False, f"Error making move: {str(e)}")
        return False

def test_invalid_move(session_id):
    """Test 5: Invalid Move Rejection"""
    print(f"\n{Colors.CYAN}Test 5: Invalid Move Rejection{Colors.RESET}")
    print("Testing invalid move rejection...")
    
    if not session_id:
        log_test('Invalid Move Rejection', False, 'No session ID available')
        return False
    
    try:
        result = make_request(f"{API_BASE}/game/{session_id}/move", 'POST', {
            'from_position': [10, 10],
            'to_position': [20, 20]
        })
        
        if not result['success']:
            log_test('Invalid Move Rejection', True, 'Invalid move correctly rejected')
            return True
        else:
            log_test('Invalid Move Rejection', False, 'Invalid move was accepted (should be rejected)')
            return False
    except Exception as e:
        log_test('Invalid Move Rejection', False, f"Error testing invalid move: {str(e)}")
        return False

def test_ai_move(session_id):
    """Test 6: AI Move Generation"""
    print(f"\n{Colors.CYAN}Test 6: AI Move Generation{Colors.RESET}")
    print("Requesting AI move...")
    
    if not session_id:
        log_test('AI Move Generation', False, 'No session ID available')
        return False
    
    try:
        # Send empty JSON object for POST request
        result = make_request(f"{API_BASE}/game/{session_id}/ai-move", 'POST', {})
        
        if result['success'] and result['data'].get('move_from') and result['data'].get('move_to'):
            move_from = result['data']['move_from']
            move_to = result['data']['move_to']
            log_test('AI Move Generation', True, f"AI moved from {move_from} to {move_to}")
            return True
        else:
            log_test('AI Move Generation', False, f"AI move failed: {json.dumps(result['data'])}")
            return False
    except Exception as e:
        log_test('AI Move Generation', False, f"Error requesting AI move: {str(e)}")
        return False

def test_game_state(session_id):
    """Test 7: Game State Retrieval"""
    print(f"\n{Colors.CYAN}Test 7: Game State Retrieval{Colors.RESET}")
    print("Retrieving game state...")
    
    if not session_id:
        log_test('Game State Retrieval', False, 'No session ID available')
        return False
    
    try:
        result = make_request(f"{API_BASE}/game/{session_id}/state")
        
        if result['success'] and result['data'].get('board_state'):
            move_count = result['data'].get('move_count', 0)
            log_test('Game State Retrieval', True, f"Game state retrieved: {move_count} moves made")
            return True
        else:
            log_test('Game State Retrieval', False, f"Failed to get state: {json.dumps(result['data'])}")
            return False
    except Exception as e:
        log_test('Game State Retrieval', False, f"Error getting game state: {str(e)}")
        return False

def test_complete_game_flow():
    """Test 8: Complete Game Flow"""
    print(f"\n{Colors.CYAN}Test 8: Complete Game Flow{Colors.RESET}")
    print("Running complete game flow...")
    
    try:
        # Create game
        create_result = make_request(f"{API_BASE}/game/new", 'POST', {
            'ai_difficulty': 2,
            'player_color': 'white'
        })
        
        if not create_result['success']:
            raise Exception('Game creation failed')
        
        session_id = create_result['data']['session_id']
        
        # Make player move
        move_result = make_request(f"{API_BASE}/game/{session_id}/move", 'POST', {
            'from_position': [3, 0],
            'to_position': [2, 0]
        })
        
        if not move_result['success']:
            raise Exception('Player move failed')
        
        # Request AI move (send empty JSON object)
        ai_result = make_request(f"{API_BASE}/game/{session_id}/ai-move", 'POST', {})
        
        if not ai_result['success']:
            raise Exception('AI move failed')
        
        # Get game state
        state_result = make_request(f"{API_BASE}/game/{session_id}/state")
        
        if not state_result['success']:
            raise Exception('Get state failed')
        
        log_test('Complete Game Flow', True, 'All backend operations work correctly')
        return True
    except Exception as e:
        log_test('Complete Game Flow', False, str(e))
        return False

def print_summary():
    """Print test summary"""
    total = tests_passed + tests_failed
    success_rate = round((tests_passed / total) * 100) if total > 0 else 0
    
    print(f"\n{'═' * 60}")
    print(f"{Colors.BLUE}TEST SUMMARY{Colors.RESET}")
    print(f"{'═' * 60}")
    print(f"{Colors.GREEN}Tests Passed:{Colors.RESET} {tests_passed}")
    print(f"{Colors.RED}Tests Failed:{Colors.RESET} {tests_failed}")
    print(f"Total Tests: {total}")
    print(f"Success Rate: {success_rate}%")
    print(f"{'═' * 60}")
    
    if tests_failed == 0:
        print(f"\n{Colors.GREEN}✅ ALL TESTS PASSED{Colors.RESET}")
        print(f"{Colors.GREEN}Backend integration works correctly after UI reorganization.{Colors.RESET}")
        print(f"{Colors.GREEN}Requirement 3.5 is satisfied.{Colors.RESET}")
    else:
        print(f"\n{Colors.RED}❌ SOME TESTS FAILED{Colors.RESET}")
        print(f"{Colors.YELLOW}Please review the failed tests above.{Colors.RESET}")

def run_tests():
    """Main test runner"""
    print(f"{Colors.BLUE}{'═' * 60}{Colors.RESET}")
    print(f"{Colors.BLUE}Task 7.6: Backend Integration Verification{Colors.RESET}")
    print(f"{Colors.BLUE}Requirement 3.5: Backend integration functionality preserved{Colors.RESET}")
    print(f"{Colors.BLUE}{'═' * 60}{Colors.RESET}")
    
    # Test 1: Health Check
    backend_available = test_health_check()
    
    if not backend_available:
        print(f"\n{Colors.YELLOW}⚠️  Backend is not available.{Colors.RESET}")
        print(f"{Colors.YELLOW}Please start the backend server to run integration tests.{Colors.RESET}")
        print(f"\n{Colors.CYAN}To start the backend:{Colors.RESET}")
        print("  cd backend")
        print("  python3 run.py")
        print_summary()
        sys.exit(1)
    
    # Test 2: Game Creation
    session_id = test_game_creation()
    
    # Test 3: Custom Position Game
    test_custom_position_game()
    
    # Test 4: Player Move
    test_player_move(session_id)
    
    # Test 5: Invalid Move Rejection
    test_invalid_move(session_id)
    
    # Test 6: AI Move
    test_ai_move(session_id)
    
    # Test 7: Game State Retrieval
    test_game_state(session_id)
    
    # Test 8: Complete Game Flow
    test_complete_game_flow()
    
    # Print summary
    print_summary()
    
    # Exit with appropriate code
    sys.exit(1 if tests_failed > 0 else 0)

if __name__ == '__main__':
    try:
        run_tests()
    except Exception as e:
        print(f"\n{Colors.RED}Fatal error:{Colors.RESET}", str(e))
        sys.exit(1)
