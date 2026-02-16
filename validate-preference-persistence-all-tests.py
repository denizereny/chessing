#!/usr/bin/env python3

"""
Comprehensive Test Validation for PreferencePersistence
Runs all unit tests and property-based tests
Tasks: 3.1, 3.2, 3.3, 3.4
Requirements: 4.1, 4.2, 4.5, 9.2, 9.3
"""

import subprocess
import sys

print('\n' + '='*70)
print('🧪 COMPREHENSIVE PREFERENCE PERSISTENCE TEST SUITE')
print('='*70)
print('\nTasks: 3.1, 3.2, 3.3, 3.4')
print('Requirements: 4.1, 4.2, 4.5, 9.2, 9.3')
print('\n' + '='*70)

all_passed = True

# Run unit tests
print('\n\n📋 PHASE 1: Unit Tests')
print('-'*70)
result = subprocess.run(['python3', 'run-preference-persistence-tests.py'], 
                       capture_output=False)
if result.returncode != 0:
    all_passed = False
    print('\n❌ Unit tests failed!')
else:
    print('\n✅ Unit tests passed!')

# Run property-based tests
print('\n\n📋 PHASE 2: Property-Based Tests')
print('-'*70)
result = subprocess.run(['python3', 'run-preference-persistence-property-tests.py'], 
                       capture_output=False)
if result.returncode != 0:
    all_passed = False
    print('\n❌ Property-based tests failed!')
else:
    print('\n✅ Property-based tests passed!')

# Final summary
print('\n\n' + '='*70)
print('📊 FINAL TEST SUMMARY')
print('='*70)

if all_passed:
    print('\n✅ ALL TESTS PASSED!')
    print('\n✓ Task 3.1: PreferencePersistence class implementation - VERIFIED')
    print('✓ Task 3.2: Property test for preference storage round-trip - VERIFIED')
    print('✓ Task 3.3: Property test for invalid preference rejection - VERIFIED')
    print('✓ Task 3.4: Unit tests for storage error handling - VERIFIED')
    print('\n✓ Requirements 4.1, 4.2: Preference storage and retrieval - VERIFIED')
    print('✓ Requirements 4.5, 9.2: Storage fallback mechanisms - VERIFIED')
    print('✓ Requirement 9.3: Invalid preference rejection - VERIFIED')
    print('\n' + '='*70)
    print('\n🎉 PreferencePersistence is fully tested and validated!')
    print('\n' + '='*70 + '\n')
    sys.exit(0)
else:
    print('\n❌ SOME TESTS FAILED!')
    print('\nPlease review the test output above for details.')
    print('\n' + '='*70 + '\n')
    sys.exit(1)
