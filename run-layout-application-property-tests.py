#!/usr/bin/env python3
"""
Property-Based Test Runner for Layout Application Engine
Runs property tests using Node.js with fast-check
"""

import subprocess
import sys
import os

def run_property_tests():
    """Run property-based tests for layout application engine"""
    
    print("🧪 Running Layout Application Engine Property Tests...")
    print("=" * 60)
    
    # Create a temporary Node.js test runner
    test_runner_code = """
const fc = require('fast-check');

// Mock DOM environment for Node.js
global.window = {
    innerWidth: 1024,
    innerHeight: 768,
    testGameState: null
};

global.document = {
    documentElement: {
        style: {
            setProperty: () => {},
            getPropertyValue: () => '',
            removeProperty: () => {}
        }
    },
    body: {
        classList: {
            add: () => {},
            remove: () => {},
            contains: () => false
        },
        style: {
            transition: ''
        }
    },
    dispatchEvent: () => {},
    addEventListener: () => {}
};

// Load modules
const DeviceProfile = require('./js/device-profile.js');
const DeviceProfileManager = require('./js/device-profile-manager.js');
const LayoutState = require('./js/layout-state.js');
const LayoutApplicationEngine = require('./js/layout-application-engine.js');

// Load property tests
const PropertyTests = require('./test/layout-application-property-tests.js');

// Run all property tests
const results = PropertyTests.runAllPropertyTests();

// Exit with appropriate code
process.exit(results.allPassed ? 0 : 1);
"""
    
    # Write test runner to temporary file
    runner_file = 'temp_property_test_runner.js'
    with open(runner_file, 'w') as f:
        f.write(test_runner_code)
    
    try:
        # Run the test runner
        result = subprocess.run(
            ['node', runner_file],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        # Print output
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr, file=sys.stderr)
        
        # Clean up
        os.remove(runner_file)
        
        # Return exit code
        return result.returncode
        
    except subprocess.TimeoutExpired:
        print("❌ Tests timed out after 60 seconds")
        os.remove(runner_file)
        return 1
    except FileNotFoundError:
        print("❌ Node.js not found. Please install Node.js to run property tests.")
        os.remove(runner_file)
        return 1
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        if os.path.exists(runner_file):
            os.remove(runner_file)
        return 1

if __name__ == '__main__':
    exit_code = run_property_tests()
    sys.exit(exit_code)
