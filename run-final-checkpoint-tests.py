#!/usr/bin/env python3
"""
Final Checkpoint - Comprehensive Testing
Task 14: Run all responsive settings menu test suites

This script executes all test suites for the responsive settings menu system:
1. Property-based tests
2. Integration tests
3. Feature preservation tests
4. ARIA accessibility tests
5. Animation tests
6. Board size calculation tests
"""

import subprocess
import sys
import os
from pathlib import Path

# ANSI color codes
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
BOLD = '\033[1m'
RESET = '\033[0m'

def print_header(text):
    """Print a formatted header"""
    print(f"\n{BOLD}{BLUE}{'=' * 70}{RESET}")
    print(f"{BOLD}{BLUE}{text}{RESET}")
    print(f"{BOLD}{BLUE}{'=' * 70}{RESET}\n")

def print_section(text):
    """Print a formatted section header"""
    print(f"\n{BOLD}{YELLOW}{text}{RESET}")
    print(f"{YELLOW}{'-' * 70}{RESET}")

def print_success(text):
    """Print success message"""
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text):
    """Print error message"""
    print(f"{RED}❌ {text}{RESET}")

def print_info(text):
    """Print info message"""
    print(f"{BLUE}ℹ️  {text}{RESET}")

def run_test_suite(name, command, description):
    """
    Run a test suite and return success status
    
    Args:
        name: Name of the test suite
        command: Command to execute
        description: Description of what's being tested
    
    Returns:
        bool: True if tests passed, False otherwise
    """
    print_section(f"Running {name}")
    print_info(description)
    print()
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        # Print output
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr)
        
        # Check result
        if result.returncode == 0:
            print_success(f"{name} PASSED")
            return True
        else:
            print_error(f"{name} FAILED (exit code: {result.returncode})")
            return False
            
    except subprocess.TimeoutExpired:
        print_error(f"{name} TIMEOUT (exceeded 60 seconds)")
        return False
    except Exception as e:
        print_error(f"{name} ERROR: {str(e)}")
        return False

def check_file_exists(filepath):
    """Check if a file exists"""
    return Path(filepath).exists()

def main():
    """Main test execution function"""
    print_header("🧪 FINAL CHECKPOINT - COMPREHENSIVE TESTING")
    print_info("Task 14: Responsive Settings Menu System")
    print_info("Executing all test suites...")
    
    # Test suite definitions
    test_suites = []
    
    # 1. Property-based tests
    if check_file_exists("test/responsive-settings-menu-properties.test.js"):
        print_info("✓ Found property tests")
        # Note: These are browser-based tests, we'll note them for manual verification
    else:
        print_error("✗ Property tests file not found")
    
    # 2. Integration tests
    if check_file_exists("run-integration-tests.js"):
        test_suites.append({
            'name': 'Integration Tests',
            'command': 'node run-integration-tests.js',
            'description': 'Tests integration between responsive layout and settings menu'
        })
    
    # 3. Feature preservation tests
    if check_file_exists("run-feature-preservation-tests.js"):
        test_suites.append({
            'name': 'Feature Preservation Tests',
            'command': 'node run-feature-preservation-tests.js',
            'description': 'Verifies all existing features work correctly in the new menu'
        })
    
    # 4. ARIA tests
    if check_file_exists("run-aria-tests.js"):
        test_suites.append({
            'name': 'ARIA Accessibility Tests',
            'command': 'node run-aria-tests.js',
            'description': 'Tests keyboard navigation and screen reader support'
        })
    
    # 5. Board size calculation tests
    if check_file_exists("test/board-size-calculation.test.js"):
        print_info("✓ Found board size calculation tests")
        # Note: These are browser-based tests
    
    # 6. Animation tests
    if check_file_exists("test/responsive-settings-menu-animations.test.js"):
        print_info("✓ Found animation tests")
        # Note: These are browser-based tests
    
    # Execute Node.js test suites
    results = []
    for suite in test_suites:
        success = run_test_suite(
            suite['name'],
            suite['command'],
            suite['description']
        )
        results.append({
            'name': suite['name'],
            'passed': success
        })
    
    # Print summary
    print_header("📊 TEST SUMMARY")
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r['passed'])
    failed_tests = total_tests - passed_tests
    
    print(f"\n{BOLD}Node.js Test Suites:{RESET}")
    print(f"  Total:  {total_tests}")
    print(f"  {GREEN}Passed: {passed_tests}{RESET}")
    print(f"  {RED}Failed: {failed_tests}{RESET}")
    
    print(f"\n{BOLD}Results by Suite:{RESET}")
    for result in results:
        status = f"{GREEN}✅ PASSED{RESET}" if result['passed'] else f"{RED}❌ FAILED{RESET}"
        print(f"  {result['name']}: {status}")
    
    # Browser-based tests note
    print(f"\n{BOLD}{YELLOW}Browser-Based Tests (Manual Verification Required):{RESET}")
    print(f"  {YELLOW}⚠️  The following tests require browser execution:{RESET}")
    print(f"     1. Property-based tests (test-responsive-settings-menu-properties.html)")
    print(f"     2. Board size calculation (test-board-size-calculation.html)")
    print(f"     3. Animation tests (test-responsive-menu-checkpoint-6.html)")
    print(f"     4. Feature preservation (test-feature-preservation.html)")
    print(f"     5. ARIA attributes (test-aria-attributes.html)")
    
    print(f"\n{BOLD}Test Files Location:{RESET}")
    print(f"  • test/responsive-settings-menu-properties.test.js")
    print(f"  • test/responsive-settings-menu-integration.test.js")
    print(f"  • test/responsive-settings-menu-feature-preservation.test.js")
    print(f"  • test/responsive-settings-menu-aria.test.js")
    print(f"  • test/responsive-settings-menu-animations.test.js")
    print(f"  • test/board-size-calculation.test.js")
    
    print(f"\n{BOLD}HTML Test Runners:{RESET}")
    print(f"  • test-responsive-settings-menu-properties.html")
    print(f"  • test-responsive-settings-menu-integration.html")
    print(f"  • test-feature-preservation.html")
    print(f"  • test-aria-attributes.html")
    print(f"  • test-responsive-menu-checkpoint-6.html (includes animations)")
    print(f"  • test-board-size-calculation.html")
    
    # Final status
    print_header("🎯 FINAL STATUS")
    
    if failed_tests == 0:
        print_success("All Node.js test suites passed!")
        print_info("Browser-based tests require manual verification in a web browser.")
        print_info("Open the HTML test runners listed above to complete verification.")
        return 0
    else:
        print_error(f"{failed_tests} test suite(s) failed!")
        print_info("Review the errors above and fix the issues.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
