#!/usr/bin/env python3

"""
Validation script for Animation Queuing Property Test
Verifies test implementation and runs basic checks
"""

import os
import sys
import re

print('=== Animation Queuing Property Test Validation ===\n')

# Check if test file exists
test_file = os.path.join(os.path.dirname(__file__), 'animation-queuing-property.test.js')
if not os.path.exists(test_file):
    print(f'❌ Test file not found: {test_file}')
    sys.exit(1)
print('✓ Test file exists')

# Check if HTML runner exists
html_file = os.path.join(os.path.dirname(__file__), 'test-animation-queuing-property.html')
if not os.path.exists(html_file):
    print(f'❌ HTML runner not found: {html_file}')
    sys.exit(1)
print('✓ HTML runner exists')

# Read and validate test file content
with open(test_file, 'r') as f:
    test_content = f.read()

# Check for required components
required_components = [
    'Property 27: Animation Queuing',
    'Validates: Requirements 8.5',
    'runAnimationQueuingPropertyTest',
    'fc.assert',
    'numRuns: 100',
    'DOMUpdater'
]

print('\nValidating test content...')
all_components_found = True

for component in required_components:
    if component in test_content:
        print(f'✓ Found: {component}')
    else:
        print(f'❌ Missing: {component}')
        all_components_found = False

# Check for all 6 properties
properties = [
    'Property 1: Layout requests during animation are queued',
    'Property 2: Queued updates execute after animation completes',
    'Property 3: Animations are not interrupted by new requests',
    'Property 4: Batch updates queue correctly during animations',
    'Property 5: Layout configuration updates queue during animations',
    'Property 6: Queue processes in order (FIFO)'
]

print('\nValidating property tests...')
for i, prop in enumerate(properties, 1):
    if prop in test_content:
        print(f'✓ Property {i} implemented')
    else:
        print(f'❌ Property {i} missing')
        all_components_found = False

# Check for animation queuing specific tests
queuing_checks = [
    'isAnimating()',
    'getQueuedUpdateCount()',
    'updateElementPosition',
    'batchUpdate',
    'applyLayout'
]

print('\nValidating animation queuing checks...')
for check in queuing_checks:
    if check in test_content:
        print(f'✓ Uses: {check}')
    else:
        print(f'❌ Missing: {check}')
        all_components_found = False

# Validate HTML runner
with open(html_file, 'r') as f:
    html_content = f.read()

print('\nValidating HTML runner...')
html_requirements = [
    'animation-queuing-property.test.js',
    'dom-updater.js',
    'setup-fast-check.js',
    'runAnimationQueuingPropertyTest'
]

for req in html_requirements:
    if req in html_content:
        print(f'✓ HTML includes: {req}')
    else:
        print(f'❌ HTML missing: {req}')
        all_components_found = False

# Check for proper test structure
print('\nValidating test structure...')

structure_checks = [
    ('Async property tests', r'fc\.asyncProperty'),
    ('Test cleanup', r'cleanupTestElement'),
    ('Error handling', r'try\s*{[\s\S]*?}\s*catch'),
    ('Promise handling', r'await'),
    ('Test results tracking', r'results\.passed')
]

for name, pattern in structure_checks:
    matches = re.findall(pattern, test_content)
    if matches:
        print(f'✓ {name}: {len(matches)} instances')
    else:
        print(f'❌ {name}: not found')
        all_components_found = False

# Summary
print('\n=== Validation Summary ===')
if all_components_found:
    print('✅ All validation checks passed!')
    print('\nTest Implementation Summary:')
    print('- Property 27: Animation Queuing')
    print('- Validates: Requirements 8.5')
    print('- 6 property tests implemented')
    print('- 100 iterations per property')
    print('- Tests animation queuing, interruption prevention, and FIFO ordering')
    print('\nTo run the test:')
    print('1. Open test-animation-queuing-property.html in a browser')
    print('2. Click "Run Property Test"')
    print('3. Wait for all 600 iterations to complete')
    sys.exit(0)
else:
    print('❌ Validation failed. Please fix the issues above.')
    sys.exit(1)
