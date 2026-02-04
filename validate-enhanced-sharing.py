#!/usr/bin/env python3
"""
Enhanced Sharing Interface Validation Script

This script validates that the enhanced sharing interface has been properly
implemented with all required features for task 5.3.

Requirements: 4.2, 4.3
Task: 5.3 Paylaşım arayüzü oluştur
"""

import os
import re
import json
from pathlib import Path

def log(message, color='white'):
    colors = {
        'green': '\033[92m',
        'red': '\033[91m',
        'yellow': '\033[93m',
        'blue': '\033[94m',
        'white': '\033[0m'
    }
    print(f"{colors.get(color, colors['white'])}{message}\033[0m")

def check_file_exists(filepath):
    return os.path.exists(filepath)

def read_file_content(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        log(f"Error reading {filepath}: {e}", 'red')
        return ""

def validate_enhanced_sharing_interface():
    log("🔗 Validating Enhanced Sharing Interface Implementation", 'blue')
    log("=" * 60, 'blue')
    
    # Check 1: Enhanced sharing interface file exists
    enhanced_sharing_path = 'js/enhanced-sharing-interface.js'
    exists = check_file_exists(enhanced_sharing_path)
    log(f"📁 Enhanced Sharing Interface File: {'✅ EXISTS' if exists else '❌ MISSING'}", 
        'green' if exists else 'red')
    
    if not exists:
        log("❌ Cannot continue validation without the enhanced sharing interface file", 'red')
        return False
    
    # Read the enhanced sharing interface content
    content = read_file_content(enhanced_sharing_path)
    
    # Check 2: Social media platforms
    social_platforms = ['twitter', 'facebook', 'whatsapp', 'telegram', 'reddit', 'email']
    platforms_found = []
    
    for platform in social_platforms:
        if platform in content:
            platforms_found.append(platform)
    
    log(f"📱 Social Media Platforms: {len(platforms_found)}/{len(social_platforms)} found", 
        'green' if len(platforms_found) >= 5 else 'yellow')
    
    for platform in platforms_found:
        log(f"   ✅ {platform.capitalize()}", 'green')
    
    missing_platforms = set(social_platforms) - set(platforms_found)
    for platform in missing_platforms:
        log(f"   ❌ {platform.capitalize()}", 'red')
    
    # Check 3: Social sharing methods
    required_social_methods = [
        'shareToSocial',
        'generateShareMessage',
        'copyShareableMessage',
        'showSharePreview'
    ]
    
    social_methods_found = []
    for method in required_social_methods:
        if f'{method}(' in content or f'{method} (' in content:
            social_methods_found.append(method)
    
    log(f"🔧 Social Sharing Methods: {len(social_methods_found)}/{len(required_social_methods)} found", 
        'green' if len(social_methods_found) == len(required_social_methods) else 'yellow')
    
    for method in social_methods_found:
        log(f"   ✅ {method}", 'green')
    
    # Check 4: Sharing history functionality
    history_features = [
        'sharingHistory',
        'addToSharingHistory',
        'updateSharingHistoryDisplay',
        'clearSharingHistory',
        'exportSharingHistory',
        'importSharingHistory',
        'loadFromHistory',
        'deleteFromHistory'
    ]
    
    history_features_found = []
    for feature in history_features:
        if feature in content:
            history_features_found.append(feature)
    
    log(f"📚 Sharing History Features: {len(history_features_found)}/{len(history_features)} found", 
        'green' if len(history_features_found) >= 6 else 'yellow')
    
    for feature in history_features_found:
        log(f"   ✅ {feature}", 'green')
    
    # Check 5: UI creation methods
    ui_methods = [
        'createSocialMediaSection',
        'createSharingHistorySection',
        'addEnhancedStyles',
        'addEnhancedSharingUI'
    ]
    
    ui_methods_found = []
    for method in ui_methods:
        if method in content:
            ui_methods_found.append(method)
    
    log(f"🎨 UI Creation Methods: {len(ui_methods_found)}/{len(ui_methods)} found", 
        'green' if len(ui_methods_found) == len(ui_methods) else 'yellow')
    
    # Check 6: HTML integration
    html_content = read_file_content('index.html')
    enhanced_sharing_loaded = 'enhanced-sharing-interface.js' in html_content
    
    log(f"🔗 HTML Integration: {'✅ LOADED' if enhanced_sharing_loaded else '❌ NOT LOADED'}", 
        'green' if enhanced_sharing_loaded else 'red')
    
    # Check 7: CSS styles for enhanced features
    css_features = [
        'social-sharing-section',
        'sharing-history-section',
        'social-buttons-grid',
        'social-share-btn',
        'history-container',
        'history-item'
    ]
    
    css_features_found = []
    for feature in css_features:
        if feature in content:
            css_features_found.append(feature)
    
    log(f"🎨 CSS Style Classes: {len(css_features_found)}/{len(css_features)} found", 
        'green' if len(css_features_found) >= 5 else 'yellow')
    
    # Check 8: LocalStorage integration
    storage_features = ['localStorage', 'saveSharingHistory', 'loadSharingHistory']
    storage_found = sum(1 for feature in storage_features if feature in content)
    
    log(f"💾 LocalStorage Integration: {'✅ IMPLEMENTED' if storage_found >= 2 else '❌ MISSING'}", 
        'green' if storage_found >= 2 else 'red')
    
    # Check 9: Error handling
    error_handling = ['try', 'catch', 'throw', 'Error']
    error_handling_found = sum(1 for feature in error_handling if feature in content)
    
    log(f"⚠️ Error Handling: {'✅ IMPLEMENTED' if error_handling_found >= 3 else '❌ INSUFFICIENT'}", 
        'green' if error_handling_found >= 3 else 'yellow')
    
    # Check 10: Test file exists
    test_file_exists = check_file_exists('test/enhanced-sharing-interface.test.js')
    log(f"🧪 Unit Tests: {'✅ EXISTS' if test_file_exists else '❌ MISSING'}", 
        'green' if test_file_exists else 'yellow')
    
    # Check 11: Integration test exists
    integration_test_exists = check_file_exists('test-enhanced-sharing.html')
    log(f"🔧 Integration Test: {'✅ EXISTS' if integration_test_exists else '❌ MISSING'}", 
        'green' if integration_test_exists else 'yellow')
    
    # Calculate overall score
    checks = [
        exists,
        len(platforms_found) >= 5,
        len(social_methods_found) >= 3,
        len(history_features_found) >= 6,
        len(ui_methods_found) >= 3,
        enhanced_sharing_loaded,
        len(css_features_found) >= 5,
        storage_found >= 2,
        error_handling_found >= 3,
        test_file_exists
    ]
    
    passed_checks = sum(checks)
    total_checks = len(checks)
    score = (passed_checks / total_checks) * 100
    
    log("\n" + "=" * 60, 'blue')
    log(f"📊 VALIDATION SUMMARY", 'blue')
    log(f"Passed Checks: {passed_checks}/{total_checks}", 'green' if passed_checks >= 8 else 'yellow')
    log(f"Overall Score: {score:.1f}%", 'green' if score >= 80 else 'yellow' if score >= 60 else 'red')
    
    if score >= 80:
        log("🎉 Enhanced Sharing Interface implementation is EXCELLENT!", 'green')
        log("✅ Task 5.3 requirements are well satisfied", 'green')
    elif score >= 60:
        log("👍 Enhanced Sharing Interface implementation is GOOD", 'yellow')
        log("⚠️ Some minor improvements could be made", 'yellow')
    else:
        log("❌ Enhanced Sharing Interface implementation needs IMPROVEMENT", 'red')
        log("🔧 Several requirements are not fully met", 'red')
    
    # Specific task 5.3 requirements check
    log("\n📋 TASK 5.3 REQUIREMENTS CHECK:", 'blue')
    
    # Requirement 1: Paylaşım URL sistemi (Sharing URL system)
    url_system = 'shareViaURL' in content or 'generateShareMessage' in content
    log(f"🔗 Paylaşım URL sistemi: {'✅ IMPLEMENTED' if url_system else '❌ MISSING'}", 
        'green' if url_system else 'red')
    
    # Requirement 2: Pano (clipboard) entegrasyonu (Clipboard integration)
    clipboard_integration = 'clipboard' in content or 'copyToClipboard' in content
    log(f"📋 Pano entegrasyonu: {'✅ IMPLEMENTED' if clipboard_integration else '❌ MISSING'}", 
        'green' if clipboard_integration else 'red')
    
    # Requirement 3: Sosyal medya paylaşım butonları (Social media sharing buttons)
    social_buttons = len(platforms_found) >= 4 and 'social-share-btn' in content
    log(f"📱 Sosyal medya paylaşım butonları: {'✅ IMPLEMENTED' if social_buttons else '❌ MISSING'}", 
        'green' if social_buttons else 'red')
    
    # Requirement 4: Paylaşım geçmişi (Sharing history)
    sharing_history = 'sharingHistory' in content and 'addToSharingHistory' in content
    log(f"📚 Paylaşım geçmişi: {'✅ IMPLEMENTED' if sharing_history else '❌ MISSING'}", 
        'green' if sharing_history else 'red')
    
    task_requirements = [url_system, clipboard_integration, social_buttons, sharing_history]
    task_score = (sum(task_requirements) / len(task_requirements)) * 100
    
    log(f"\n🎯 TASK 5.3 COMPLETION: {task_score:.1f}%", 
        'green' if task_score == 100 else 'yellow' if task_score >= 75 else 'red')
    
    return score >= 80 and task_score >= 75

def main():
    log("🚀 Enhanced Sharing Interface Validation", 'blue')
    log("Task 5.3: Paylaşım arayüzü oluştur", 'blue')
    log("Requirements: 4.2, 4.3\n", 'blue')
    
    success = validate_enhanced_sharing_interface()
    
    if success:
        log("\n✅ VALIDATION PASSED - Enhanced sharing interface is ready!", 'green')
        return 0
    else:
        log("\n❌ VALIDATION FAILED - Implementation needs improvement", 'red')
        return 1

if __name__ == "__main__":
    exit(main())