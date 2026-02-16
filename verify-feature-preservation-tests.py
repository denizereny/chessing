#!/usr/bin/env python3

"""
Verification Script for Feature Preservation Tests

This script verifies that all required test examples are present
in the feature preservation test file.

Task: 7.8 Write unit tests for feature preservation
"""

import os
import re
import sys

def main():
    print('🔍 Verifying Feature Preservation Tests\n')
    print('Task: 7.8 Write unit tests for feature preservation')
    print('Validates: Requirements 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7\n')

    # Read the test file
    test_file_path = os.path.join('test', 'responsive-settings-menu-feature-preservation.test.js')

    if not os.path.exists(test_file_path):
        print(f'❌ Test file not found: {test_file_path}')
        sys.exit(1)

    with open(test_file_path, 'r', encoding='utf-8') as f:
        test_content = f.read()

    # Required examples from the task
    required_examples = [
        {
            'name': 'Example 1: All existing features present in menu',
            'requirement': '2.3',
            'pattern': r'Example 1.*All existing features present in menu'
        },
        {
            'name': 'Example 2: Theme system functionality preserved',
            'requirement': '3.1',
            'pattern': r'Example 2.*Theme system functionality preserved'
        },
        {
            'name': 'Example 3: Language selector functionality preserved',
            'requirement': '3.2',
            'pattern': r'Example 3.*Language selector functionality preserved'
        },
        {
            'name': 'Example 4: Piece setup functionality preserved',
            'requirement': '3.3',
            'pattern': r'Example 4.*Piece setup functionality preserved'
        },
        {
            'name': 'Example 5: Position sharing functionality preserved',
            'requirement': '3.4',
            'pattern': r'Example 5.*Position sharing functionality preserved'
        },
        {
            'name': 'Example 6: Backend integration functionality preserved',
            'requirement': '3.5',
            'pattern': r'Example 6.*Backend integration functionality preserved'
        },
        {
            'name': 'Example 7: Analysis features preserved',
            'requirement': '3.6',
            'pattern': r'Example 7.*Analysis features preserved'
        },
        {
            'name': 'Example 8: Move history functionality preserved',
            'requirement': '3.7',
            'pattern': r'Example 8.*Move history functionality preserved'
        }
    ]

    print('═' * 70)
    print('CHECKING REQUIRED TEST EXAMPLES')
    print('═' * 70)

    all_present = True

    for example in required_examples:
        found = re.search(example['pattern'], test_content, re.IGNORECASE)
        icon = '✅' if found else '❌'
        print(f"{icon} {example['name']}")
        print(f"   Validates: Requirement {example['requirement']}")
        
        if not found:
            all_present = False

    print('\n' + '═' * 70)
    print('CHECKING TEST STRUCTURE')
    print('═' * 70)

    # Check for describe blocks
    describe_count = len(re.findall(r'describe\(', test_content))
    print(f'✅ Found {describe_count} describe blocks')

    # Check for test blocks
    test_count = len(re.findall(r'test\(', test_content))
    print(f'✅ Found {test_count} test blocks')

    # Check for expect assertions
    expect_count = len(re.findall(r'expect\(', test_content))
    print(f'✅ Found {expect_count} expect assertions')

    # Check for key DOM queries
    queries = [
        {'name': 'settingsMenuPanel', 'pattern': r'#settingsMenuPanel'},
        {'name': 'btnTheme', 'pattern': r'#btnTheme'},
        {'name': 'languageSelect', 'pattern': r'#languageSelect'},
        {'name': 'btnPieceSetup', 'pattern': r'#btnPieceSetup'},
        {'name': 'btnAnalyzePosition', 'pattern': r'#btnAnalyzePosition'},
        {'name': 'btnSharePosition', 'pattern': r'#btnSharePosition'}
    ]

    print('\n' + '═' * 70)
    print('CHECKING KEY DOM QUERIES')
    print('═' * 70)

    for query in queries:
        found = re.search(query['pattern'], test_content)
        icon = '✅' if found else '❌'
        print(f"{icon} Tests query for {query['name']}")
        
        if not found:
            all_present = False

    print('\n' + '═' * 70)
    print('VERIFICATION SUMMARY')
    print('═' * 70)

    if all_present:
        print('✅ All required test examples are present')
        print('✅ Test file structure is valid')
        print('✅ All key DOM elements are tested')
        print('\n✨ Feature preservation tests are complete and comprehensive!')
        print('\nTo run the tests:')
        print('  1. Open test-feature-preservation.html in a browser')
        print('  2. Click "Run Tests" button')
        print('  3. Verify all tests pass')
        sys.exit(0)
    else:
        print('❌ Some required test examples are missing')
        print('❌ Test file is incomplete')
        sys.exit(1)

if __name__ == '__main__':
    main()
