#!/usr/bin/env python3
"""
Test Runner for Property 14: Focus Restoration on Close

**Feature: responsive-settings-menu, Property 14: Focus restoration on close**
**Validates: Requirements 6.4**

This script runs the property-based tests for focus restoration using Selenium.
"""

import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def run_tests():
    print('🚀 Starting Property 14: Focus Restoration Tests')
    print('=' * 60)
    
    driver = None
    try:
        # Setup Chrome options
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        
        # Create driver
        driver = webdriver.Chrome(options=chrome_options)
        driver.set_window_size(1280, 720)
        
        # Navigate to test page
        test_url = 'http://localhost:8084/test-property-14-focus-restoration.html'
        print(f'📄 Loading test page: {test_url}')
        
        driver.get(test_url)
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, 'status'))
        )
        print('✅ Test page loaded successfully')
        
        # Run the tests
        print('\n🔬 Running property-based tests...\n')
        
        # Click the run tests button
        run_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Run Property Tests')]")
        run_button.click()
        
        # Wait for tests to complete (check for success or error status)
        WebDriverWait(driver, 60).until(
            lambda d: 'success' in d.find_element(By.ID, 'status').get_attribute('class') or 
                     'error' in d.find_element(By.ID, 'status').get_attribute('class')
        )
        
        # Give it a moment to finish
        time.sleep(1)
        
        # Get test results
        total_tests = driver.find_element(By.ID, 'totalTests').text
        passed_tests = driver.find_element(By.ID, 'passedTests').text
        failed_tests = driver.find_element(By.ID, 'failedTests').text
        total_iterations = driver.find_element(By.ID, 'totalIterations').text
        status = driver.find_element(By.ID, 'status').text
        output = driver.find_element(By.ID, 'outputContent').text
        
        # Display results
        print('\n' + '=' * 60)
        print('📊 TEST RESULTS')
        print('=' * 60)
        print(f'Total Tests: {total_tests}')
        print(f'Passed: {passed_tests}')
        print(f'Failed: {failed_tests}')
        print(f'Total Iterations: {total_iterations}')
        print(f'Status: {status}')
        print('')
        
        if int(failed_tests) == 0:
            print('✅ All property-based tests PASSED!')
            print('✅ Property 14: Focus restoration on close is verified')
            print('')
            print('Test Coverage:')
            print('  ✓ Focus restoration from any menu element')
            print('  ✓ Focus restoration at different viewport sizes')
            print('  ✓ Property-based test with 100+ random scenarios')
            print('  ✓ Focus restoration after keyboard-opened menu')
            print('')
            print('Output:')
            print(output)
            return 0
        else:
            print('❌ Some tests FAILED')
            print('\nTest Output:')
            print(output)
            return 1
            
    except Exception as e:
        print(f'❌ Error running tests: {str(e)}')
        import traceback
        traceback.print_exc()
        return 1
        
    finally:
        if driver:
            driver.quit()

if __name__ == '__main__':
    sys.exit(run_tests())
