#!/usr/bin/env node

/**
 * Task 7.6: Backend Integration Verification Script
 * 
 * This script verifies that backend integration still works correctly
 * after the UI reorganization (moving controls into settings menu).
 * 
 * Requirement 3.5: Backend integration functionality preserved
 */

const http = require('http');

// Configuration
const BACKEND_URL = 'http://localhost:5000';
const API_BASE = '/api';

// Test results
let testsPassed = 0;
let testsFailed = 0;
const testResults = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Make HTTP request
 */
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data: parsed
          });
        } catch (error) {
          resolve({
            success: false,
            statusCode: res.statusCode,
            data: responseData,
            error: 'Failed to parse response'
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Log test result
 */
function logTest(testName, passed, message) {
  const status = passed ? `${colors.green}✅ PASSED${colors.reset}` : `${colors.red}❌ FAILED${colors.reset}`;
  console.log(`\n${status}: ${testName}`);
  if (message) {
    console.log(`  ${message}`);
  }
  
  testResults.push({ testName, passed, message });
  
  if (passed) {
    testsPassed++;
  } else {
    testsFailed++;
  }
}

/**
 * Test 1: Backend Health Check
 */
async function testHealthCheck() {
  console.log(`\n${colors.cyan}Test 1: Backend Health Check${colors.reset}`);
  console.log('Verifying backend API is accessible...');
  
  try {
    const result = await makeRequest(`${API_BASE}/health`);
    
    if (result.success && result.data.status === 'healthy') {
      logTest('Backend Health Check', true, `Backend is healthy: ${JSON.stringify(result.data)}`);
      return true;
    } else {
      logTest('Backend Health Check', false, `Backend returned unhealthy status: ${JSON.stringify(result.data)}`);
      return false;
    }
  } catch (error) {
    logTest('Backend Health Check', false, `Backend is not accessible: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: Game Creation
 */
async function testGameCreation() {
  console.log(`\n${colors.cyan}Test 2: Game Creation${colors.reset}`);
  console.log('Creating a new game through backend API...');
  
  try {
    const result = await makeRequest(`${API_BASE}/game/new`, 'POST', {
      ai_difficulty: 2,
      player_color: 'white'
    });
    
    if (result.success && result.data.session_id) {
      logTest('Game Creation', true, `Game created with session ID: ${result.data.session_id}`);
      return result.data.session_id;
    } else {
      logTest('Game Creation', false, `Failed to create game: ${JSON.stringify(result.data)}`);
      return null;
    }
  } catch (error) {
    logTest('Game Creation', false, `Error creating game: ${error.message}`);
    return null;
  }
}

/**
 * Test 3: Custom Position Game Creation
 */
async function testCustomPositionGame() {
  console.log(`\n${colors.cyan}Test 3: Custom Position Game Creation${colors.reset}`);
  console.log('Creating a game with custom position...');
  
  const customBoard = [
    ['r', null, null, 'k'],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    ['R', null, 'K', null]
  ];
  
  try {
    const result = await makeRequest(`${API_BASE}/game/new`, 'POST', {
      ai_difficulty: 2,
      player_color: 'white',
      custom_position: customBoard
    });
    
    if (result.success && result.data.session_id) {
      logTest('Custom Position Game', true, `Custom position game created: ${result.data.session_id}`);
      return result.data.session_id;
    } else {
      logTest('Custom Position Game', false, `Failed to create custom game: ${JSON.stringify(result.data)}`);
      return null;
    }
  } catch (error) {
    logTest('Custom Position Game', false, `Error creating custom game: ${error.message}`);
    return null;
  }
}

/**
 * Test 4: Player Move
 */
async function testPlayerMove(sessionId) {
  console.log(`\n${colors.cyan}Test 4: Player Move${colors.reset}`);
  console.log('Making a player move...');
  
  if (!sessionId) {
    logTest('Player Move', false, 'No session ID available');
    return false;
  }
  
  try {
    const result = await makeRequest(`${API_BASE}/game/${sessionId}/move`, 'POST', {
      from_position: [3, 0],
      to_position: [2, 0]
    });
    
    if (result.success) {
      logTest('Player Move', true, 'Move executed successfully');
      return true;
    } else {
      logTest('Player Move', false, `Move failed: ${JSON.stringify(result.data)}`);
      return false;
    }
  } catch (error) {
    logTest('Player Move', false, `Error making move: ${error.message}`);
    return false;
  }
}

/**
 * Test 5: Invalid Move Rejection
 */
async function testInvalidMove(sessionId) {
  console.log(`\n${colors.cyan}Test 5: Invalid Move Rejection${colors.reset}`);
  console.log('Testing invalid move rejection...');
  
  if (!sessionId) {
    logTest('Invalid Move Rejection', false, 'No session ID available');
    return false;
  }
  
  try {
    const result = await makeRequest(`${API_BASE}/game/${sessionId}/move`, 'POST', {
      from_position: [10, 10],
      to_position: [20, 20]
    });
    
    if (!result.success) {
      logTest('Invalid Move Rejection', true, 'Invalid move correctly rejected');
      return true;
    } else {
      logTest('Invalid Move Rejection', false, 'Invalid move was accepted (should be rejected)');
      return false;
    }
  } catch (error) {
    logTest('Invalid Move Rejection', false, `Error testing invalid move: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: AI Move
 */
async function testAIMove(sessionId) {
  console.log(`\n${colors.cyan}Test 6: AI Move Generation${colors.reset}`);
  console.log('Requesting AI move...');
  
  if (!sessionId) {
    logTest('AI Move Generation', false, 'No session ID available');
    return false;
  }
  
  try {
    const result = await makeRequest(`${API_BASE}/game/${sessionId}/ai-move`, 'POST');
    
    if (result.success && result.data.move_from && result.data.move_to) {
      logTest('AI Move Generation', true, `AI moved from ${JSON.stringify(result.data.move_from)} to ${JSON.stringify(result.data.move_to)}`);
      return true;
    } else {
      logTest('AI Move Generation', false, `AI move failed: ${JSON.stringify(result.data)}`);
      return false;
    }
  } catch (error) {
    logTest('AI Move Generation', false, `Error requesting AI move: ${error.message}`);
    return false;
  }
}

/**
 * Test 7: Game State Retrieval
 */
async function testGameState(sessionId) {
  console.log(`\n${colors.cyan}Test 7: Game State Retrieval${colors.reset}`);
  console.log('Retrieving game state...');
  
  if (!sessionId) {
    logTest('Game State Retrieval', false, 'No session ID available');
    return false;
  }
  
  try {
    const result = await makeRequest(`${API_BASE}/game/${sessionId}/state`);
    
    if (result.success && result.data.board_state) {
      logTest('Game State Retrieval', true, `Game state retrieved: ${result.data.move_count} moves made`);
      return true;
    } else {
      logTest('Game State Retrieval', false, `Failed to get state: ${JSON.stringify(result.data)}`);
      return false;
    }
  } catch (error) {
    logTest('Game State Retrieval', false, `Error getting game state: ${error.message}`);
    return false;
  }
}

/**
 * Test 8: Complete Game Flow
 */
async function testCompleteGameFlow() {
  console.log(`\n${colors.cyan}Test 8: Complete Game Flow${colors.reset}`);
  console.log('Running complete game flow...');
  
  try {
    // Create game
    const createResult = await makeRequest(`${API_BASE}/game/new`, 'POST', {
      ai_difficulty: 2,
      player_color: 'white'
    });
    
    if (!createResult.success) {
      throw new Error('Game creation failed');
    }
    
    const sessionId = createResult.data.session_id;
    
    // Make player move
    const moveResult = await makeRequest(`${API_BASE}/game/${sessionId}/move`, 'POST', {
      from_position: [3, 0],
      to_position: [2, 0]
    });
    
    if (!moveResult.success) {
      throw new Error('Player move failed');
    }
    
    // Request AI move
    const aiResult = await makeRequest(`${API_BASE}/game/${sessionId}/ai-move`, 'POST');
    
    if (!aiResult.success) {
      throw new Error('AI move failed');
    }
    
    // Get game state
    const stateResult = await makeRequest(`${API_BASE}/game/${sessionId}/state`);
    
    if (!stateResult.success) {
      throw new Error('Get state failed');
    }
    
    logTest('Complete Game Flow', true, 'All backend operations work correctly');
    return true;
  } catch (error) {
    logTest('Complete Game Flow', false, error.message);
    return false;
  }
}

/**
 * Print summary
 */
function printSummary() {
  const total = testsPassed + testsFailed;
  const successRate = total > 0 ? Math.round((testsPassed / total) * 100) : 0;
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`${colors.blue}TEST SUMMARY${colors.reset}`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`${colors.green}Tests Passed:${colors.reset} ${testsPassed}`);
  console.log(`${colors.red}Tests Failed:${colors.reset} ${testsFailed}`);
  console.log(`Total Tests: ${total}`);
  console.log(`Success Rate: ${successRate}%`);
  console.log(`${'═'.repeat(60)}`);
  
  if (testsFailed === 0) {
    console.log(`\n${colors.green}✅ ALL TESTS PASSED${colors.reset}`);
    console.log(`${colors.green}Backend integration works correctly after UI reorganization.${colors.reset}`);
    console.log(`${colors.green}Requirement 3.5 is satisfied.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}❌ SOME TESTS FAILED${colors.reset}`);
    console.log(`${colors.yellow}Please review the failed tests above.${colors.reset}`);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`${colors.blue}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}Task 7.6: Backend Integration Verification${colors.reset}`);
  console.log(`${colors.blue}Requirement 3.5: Backend integration functionality preserved${colors.reset}`);
  console.log(`${colors.blue}${'═'.repeat(60)}${colors.reset}`);
  
  // Test 1: Health Check
  const backendAvailable = await testHealthCheck();
  
  if (!backendAvailable) {
    console.log(`\n${colors.yellow}⚠️  Backend is not available.${colors.reset}`);
    console.log(`${colors.yellow}Please start the backend server to run integration tests.${colors.reset}`);
    console.log(`\n${colors.cyan}To start the backend:${colors.reset}`);
    console.log(`  cd backend`);
    console.log(`  python3 run.py`);
    printSummary();
    process.exit(1);
  }
  
  // Test 2: Game Creation
  const sessionId = await testGameCreation();
  
  // Test 3: Custom Position Game
  await testCustomPositionGame();
  
  // Test 4: Player Move
  await testPlayerMove(sessionId);
  
  // Test 5: Invalid Move Rejection
  await testInvalidMove(sessionId);
  
  // Test 6: AI Move
  await testAIMove(sessionId);
  
  // Test 7: Game State Retrieval
  await testGameState(sessionId);
  
  // Test 8: Complete Game Flow
  await testCompleteGameFlow();
  
  // Print summary
  printSummary();
  
  // Exit with appropriate code
  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
