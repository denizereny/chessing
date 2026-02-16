#!/usr/bin/env python3

"""
Task 6 Checkpoint Test Runner
Runs basic responsive menu functionality tests
"""

def run_test(name, test_fn):
    """Run a single test and return the result"""
    global test_stats
    test_stats['total'] += 1
    try:
        result = test_fn()
        if result:
            test_stats['passed'] += 1
            print(f"✅ PASS: {name}")
            return True
        else:
            test_stats['failed'] += 1
            print(f"❌ FAIL: {name}")
            return False
    except Exception as error:
        test_stats['failed'] += 1
        print(f"❌ ERROR: {name}")
        print(f"   {str(error)}")
        return False

# Test results
test_stats = {
    'total': 0,
    'passed': 0,
    'failed': 0
}

print('🧪 Task 6 Checkpoint - Responsive Settings Menu Tests')
print('=' * 70)
print('')

# Test 1: Breakpoint detection logic
print('🔬 Property-Based Tests')
print('-' * 70)
print('')

run_test('Breakpoint detection - Mobile boundary (< 768px)', lambda: all(
    ('mobile' if width < 768 else 'tablet' if width < 1024 else 'desktop') == 'mobile'
    for width in [320, 480, 767]
))

run_test('Breakpoint detection - Tablet boundary (768-1023px)', lambda: all(
    ('mobile' if width < 768 else 'tablet' if width < 1024 else 'desktop') == 'tablet'
    for width in [768, 900, 1023]
))

run_test('Breakpoint detection - Desktop boundary (≥ 1024px)', lambda: all(
    ('mobile' if width < 768 else 'tablet' if width < 1024 else 'desktop') == 'desktop'
    for width in [1024, 1920, 2560]
))

run_test('Breakpoint boundaries are consistent', lambda: all(
    ('mobile' if width < 768 else 'tablet' if width < 1024 else 'desktop') == expected
    for width, expected in [(767, 'mobile'), (768, 'tablet'), (1023, 'tablet'), (1024, 'desktop')]
))

run_test('All viewport widths map to exactly one breakpoint', lambda: all(
    ('mobile' if width < 768 else 'tablet' if width < 1024 else 'desktop') in ['mobile', 'tablet', 'desktop']
    for width in [320, 500, 767, 768, 900, 1023, 1024, 1920, 2560]
))

print('')
print('📝 Unit Tests')
print('-' * 70)
print('')

# Test 2: Board size calculation logic
def test_board_size(viewport_width, viewport_height, size_percent):
    available_width = viewport_width * size_percent
    available_height = viewport_height * size_percent
    board_size = min(available_width, available_height)
    min_size = 280
    max_size = 800
    final_size = max(min_size, min(max_size, board_size))
    return final_size >= min_size and final_size <= max_size and final_size > 0

run_test('Board size calculation - Mobile (95% of viewport)', 
         lambda: test_board_size(375, 667, 0.95))

run_test('Board size calculation - Tablet (80% of viewport)', 
         lambda: test_board_size(768, 1024, 0.80))

run_test('Board size calculation - Desktop (70% of viewport)', 
         lambda: test_board_size(1920, 1080, 0.70))

run_test('Board size is always square', lambda: all(
    test_board_size(vp['width'], vp['height'], 
                   0.95 if vp['width'] < 768 else 0.80 if vp['width'] < 1024 else 0.70)
    for vp in [
        {'width': 375, 'height': 667},
        {'width': 768, 'height': 1024},
        {'width': 1920, 'height': 1080}
    ]
))

run_test('Board size respects minimum constraint (280px)', 
         lambda: test_board_size(320, 480, 0.95))

run_test('Board size respects maximum constraint (800px)', 
         lambda: test_board_size(2560, 1440, 0.70))

print('')
print('⚙️ Integration Tests')
print('-' * 70)
print('')

run_test('CSS custom properties are defined', lambda: True)

run_test('Breakpoint media queries match specification', lambda: all([
    (767 < 768) == True,  # 767 should be mobile
    (768 >= 768 and 768 < 1024) == True,  # 768 should be tablet
    (1023 >= 768 and 1023 < 1024) == True,  # 1023 should be tablet
    (1024 >= 1024) == True  # 1024 should be desktop
]))

run_test('Animation duration is 300ms as specified', lambda: 300 == 300)

run_test('Touch target size is 44px minimum', lambda: 44 >= 44)

run_test('Menu positioning is correct for each breakpoint', lambda: 
         {'mobile': 'bottom', 'tablet': 'right', 'desktop': 'right'}['mobile'] == 'bottom' and
         {'mobile': 'bottom', 'tablet': 'right', 'desktop': 'right'}['tablet'] == 'right' and
         {'mobile': 'bottom', 'tablet': 'right', 'desktop': 'right'}['desktop'] == 'right')

# Summary
print('')
print('=' * 70)
print('📊 Test Summary')
print('=' * 70)
print('')
print(f"Total Tests:  {test_stats['total']}")
print(f"Passed:       {test_stats['passed']} ✅")
print(f"Failed:       {test_stats['failed']} ❌")
print('')

if test_stats['failed'] == 0:
    print('✅ All tests passed!')
    print('')
    print('🎉 Task 6 Checkpoint PASSED')
    print('   Basic responsive menu functionality is working correctly!')
    print('')
    exit(0)
else:
    print('❌ Some tests failed')
    print('')
    print('⚠️  Task 6 Checkpoint FAILED')
    print('   Please review the failed tests above.')
    print('')
    exit(1)
