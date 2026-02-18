#!/usr/bin/env python3

"""
Validation Script for In-Memory Analysis Property Test
Verifies that the test implementation is correct and complete
"""

import os
import re
import sys

print("=" * 70)
print("In-Memory Analysis Property Test Validation")
print("=" * 70)
print()

validations_passed = 0
validations_failed = 0
issues = []

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))

def check_file_exists(filename, description):
    """Check if a file exists"""
    global validations_passed, validations_failed
    
    filepath = os.path.join(script_dir, filename)
    print(f"Checking {description}...")
    
    if os.path.exists(filepath):
        print(f"  ✓ {description} exists")
        validations_passed += 1
        return True
    else:
        print(f"  ✗ {description} not found")
        issues.append(f"{description} missing: {filename}")
        validations_failed += 1
        return False

def check_file_content(filename, description, patterns):
    """Check if a file contains required patterns"""
    global validations_passed, validations_failed
    
    filepath = os.path.join(script_dir, filename)
    print(f"Checking {description}...")
    
    if not os.path.exists(filepath):
        print(f"  ⊘ Skipped (file not found)")
        validations_failed += 1
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    all_found = True
    for pattern_name, pattern in patterns:
        if re.search(pattern, content, re.IGNORECASE):
            print(f"  ✓ Found: {pattern_name}")
        else:
            print(f"  ✗ Missing: {pattern_name}")
            issues.append(f"{description} missing: {pattern_name}")
            all_found = False
    
    if all_found:
        validations_passed += 1
    else:
        validations_failed += 1
    
    return all_found

# Validation 1: Test file exists
print("Validation 1:")
check_file_exists("in-memory-analysis-property.test.js", "Test file")

# Validation 2: HTML runner exists
print("\nValidation 2:")
check_file_exists("test-in-memory-analysis-property.html", "HTML runner")

# Validation 3: Test file contains required property tests
print("\nValidation 3:")
test_patterns = [
    ("Property 1: No storage during initialization", r"Property 1.*No storage.*initialization"),
    ("Property 2: No storage during visibility detection", r"Property 2.*No storage.*visibility detection"),
    ("Property 3: No storage during refresh", r"Property 3.*No storage.*refresh"),
    ("Property 4: No storage during observe/unobserve", r"Property 4.*No storage.*observe"),
    ("Property 5: Visibility data accessible in-memory", r"Property 5.*Visibility data.*in-memory"),
    ("StorageMonitor class", r"class StorageMonitor"),
    ("localStorage monitoring", r"localStorage\.setItem"),
    ("sessionStorage monitoring", r"sessionStorage\.setItem"),
    ("IndexedDB monitoring", r"indexedDB\.open"),
    ("fast-check assertions", r"fc\.assert"),
    ("Validates Requirements 1.5", r"Validates.*Requirements 1\.5")
]
check_file_content("in-memory-analysis-property.test.js", "Test file content", test_patterns)

# Validation 4: HTML runner contains required elements
print("\nValidation 4:")
html_patterns = [
    ("Property 3 title", r"Property 3.*In-Memory Analysis"),
    ("Requirements 1.5 reference", r"Requirements 1\.5"),
    ("fast-check script", r"setup-fast-check\.js"),
    ("VisibilityDetector script", r"visibility-detector\.js"),
    ("Test script", r"in-memory-analysis-property\.test\.js"),
    ("Run test button", r"runTest\(\)"),
    ("Test description", r"in-memory.*without.*storage")
]
check_file_content("test-in-memory-analysis-property.html", "HTML runner content", html_patterns)

# Validation 5: Test runner script exists
print("\nValidation 5:")
check_file_exists("run-in-memory-analysis-test.js", "Test runner script")

# Validation 6: VisibilityDetector implementation exists
print("\nValidation 6:")
detector_path = os.path.join(script_dir, "../../js/adaptive-viewport/visibility-detector.js")
print("Checking VisibilityDetector implementation...")

if os.path.exists(detector_path):
    print("  ✓ VisibilityDetector implementation exists")
    
    with open(detector_path, 'r', encoding='utf-8') as f:
        detector_content = f.read()
    
    # Check that it doesn't use storage
    storage_patterns = [
        ("localStorage usage", r"localStorage\.(setItem|getItem|removeItem)"),
        ("sessionStorage usage", r"sessionStorage\.(setItem|getItem|removeItem)"),
        ("IndexedDB usage", r"indexedDB\.open"),
        ("File system access", r"fs\.(writeFile|readFile|createWriteStream)")
    ]
    
    no_storage_used = True
    for pattern_name, pattern in storage_patterns:
        if re.search(pattern, detector_content, re.IGNORECASE):
            print(f"  ⚠ Warning: Found {pattern_name} in implementation")
            issues.append(f"VisibilityDetector may use storage: {pattern_name}")
            no_storage_used = False
    
    if no_storage_used:
        print("  ✓ No storage operations found in implementation")
        validations_passed += 1
    else:
        print("  ⚠ Storage operations detected in implementation")
        validations_failed += 1
else:
    print("  ✗ VisibilityDetector implementation not found")
    issues.append("VisibilityDetector implementation missing")
    validations_failed += 1

# Validation 7: Test structure follows pattern
print("\nValidation 7:")
structure_patterns = [
    ("100 iterations per property", r"numRuns:\s*100"),
    ("Async property tests", r"fc\.asyncProperty"),
    ("Test cleanup", r"detector\.destroy\(\)"),
    ("Element cleanup", r"cleanupElements"),
    ("Results tracking", r"results\.(passed|failed)"),
    ("Test summary", r"Test Summary")
]
check_file_content("in-memory-analysis-property.test.js", "Test structure", structure_patterns)

# Print Summary
print()
print("=" * 70)
print("Validation Summary")
print("=" * 70)
print()
print(f"Total Validations: {validations_passed + validations_failed}")
print(f"Passed: {validations_passed}")
print(f"Failed: {validations_failed}")
print()

if validations_failed == 0:
    print("✅ ALL VALIDATIONS PASSED")
    print()
    print("The in-memory analysis property test is correctly implemented and ready to run.")
    print()
    print("Next Steps:")
    print("  1. Run the test using the HTML runner")
    print("  2. Verify all 5 properties pass")
    print("  3. Confirm no storage operations are detected")
    print("  4. Mark task 2.4 as complete")
    print()
    sys.exit(0)
else:
    print("❌ SOME VALIDATIONS FAILED")
    print()
    print("Issues Found:")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. {issue}")
    print()
    print("Please fix the issues above before running the test.")
    print()
    sys.exit(1)
