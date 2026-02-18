#!/usr/bin/env python3
"""
Validation script for Adaptive Viewport Infrastructure
Checks that all required files are created and contain expected content
"""

import os
import sys

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        print(f"✓ {description}: {filepath}")
        return True
    else:
        print(f"✗ {description}: {filepath} NOT FOUND")
        return False

def check_file_contains(filepath, search_strings, description):
    """Check if a file contains expected strings"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            
        missing = []
        for search_str in search_strings:
            if search_str not in content:
                missing.append(search_str)
        
        if not missing:
            print(f"✓ {description}: All expected content found")
            return True
        else:
            print(f"✗ {description}: Missing content: {', '.join(missing)}")
            return False
    except Exception as e:
        print(f"✗ {description}: Error reading file: {e}")
        return False

def main():
    print("=== Adaptive Viewport Infrastructure Validation ===\n")
    
    passed = 0
    failed = 0
    
    # Check directory structure
    print("1. Directory Structure")
    if check_file_exists("js/adaptive-viewport", "Core directory"):
        passed += 1
    else:
        failed += 1
    
    if check_file_exists("test/adaptive-viewport", "Test directory"):
        passed += 1
    else:
        failed += 1
    
    # Check core files
    print("\n2. Core Infrastructure Files")
    
    files_to_check = [
        ("js/adaptive-viewport/constants.js", "Constants file"),
        ("js/adaptive-viewport/error-handler.js", "Error handler file"),
        ("js/adaptive-viewport/types.js", "Types file"),
        ("js/adaptive-viewport/base-component.js", "Base component file"),
        ("js/adaptive-viewport/README.md", "README file"),
        ("test/adaptive-viewport/setup-fast-check.js", "Fast-check setup file"),
        ("test/adaptive-viewport/test-infrastructure.html", "HTML test file"),
        ("test/adaptive-viewport/test-infrastructure.js", "Node.js test file"),
    ]
    
    for filepath, description in files_to_check:
        if check_file_exists(filepath, description):
            passed += 1
        else:
            failed += 1
    
    # Check file contents
    print("\n3. File Content Validation")
    
    # Constants
    if check_file_contains(
        "js/adaptive-viewport/constants.js",
        ["MIN_WIDTH: 320", "MAX_WIDTH: 3840", "MIN_SIZE: 280", "MIN_SPACING: 16"],
        "Constants content"
    ):
        passed += 1
    else:
        failed += 1
    
    # Error Handler
    if check_file_contains(
        "js/adaptive-viewport/error-handler.js",
        ["class ErrorHandler", "handleError", "categorizeError", "applyPolyfill", "applyDefaultLayout"],
        "Error handler content"
    ):
        passed += 1
    else:
        failed += 1
    
    # Types
    if check_file_contains(
        "js/adaptive-viewport/types.js",
        ["ValidationUtils", "isValidPosition", "isWithinViewport", "isValidDimensions"],
        "Types content"
    ):
        passed += 1
    else:
        failed += 1
    
    # Base Component
    if check_file_contains(
        "js/adaptive-viewport/base-component.js",
        ["class BaseComponent", "initialize", "destroy", "addEventListener", "debounce"],
        "Base component content"
    ):
        passed += 1
    else:
        failed += 1
    
    # Fast-check setup
    if check_file_contains(
        "test/adaptive-viewport/setup-fast-check.js",
        ["AdaptiveViewportGenerators", "viewportDimensions", "elementPosition", "AdaptiveViewportTestUtils"],
        "Fast-check setup content"
    ):
        passed += 1
    else:
        failed += 1
    
    # README
    if check_file_contains(
        "js/adaptive-viewport/README.md",
        ["Adaptive Viewport Optimizer", "Directory Structure", "Requirements Mapping", "Property-Based Testing"],
        "README content"
    ):
        passed += 1
    else:
        failed += 1
    
    # Summary
    print("\n=== Validation Summary ===")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Total: {passed + failed}")
    
    if failed == 0:
        print("\n✓ All infrastructure files validated successfully!")
        return 0
    else:
        print(f"\n✗ {failed} validation(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
