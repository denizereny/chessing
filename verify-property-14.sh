#!/bin/bash

# Verification script for Property 14: Focus Restoration on Close
# **Feature: responsive-settings-menu, Property 14: Focus restoration on close**
# **Validates: Requirements 6.4**

echo "🚀 Property 14: Focus Restoration Test Verification"
echo "=" | head -c 60
echo ""
echo ""
echo "📋 Test Information:"
echo "  Feature: responsive-settings-menu"
echo "  Task: 9.7 Write property test for focus restoration"
echo "  Property: Property 14: Focus restoration on close"
echo "  Validates: Requirements 6.4"
echo ""
echo "🌐 Opening test page in browser..."
echo "  URL: http://localhost:8084/test-property-14-focus-restoration.html"
echo ""
echo "📝 Manual Verification Steps:"
echo "  1. Click the '▶️ Run Property Tests' button"
echo "  2. Wait for tests to complete"
echo "  3. Verify all tests pass (green status)"
echo "  4. Check that total iterations >= 100"
echo ""
echo "🧪 Or use Manual Test:"
echo "  1. Click '🧪 Manual Test' button"
echo "  2. Click the settings menu toggle (3 dots)"
echo "  3. Press Tab to focus different menu elements"
echo "  4. Press Escape to close the menu"
echo "  5. Verify focus returns to the toggle button"
echo ""
echo "✅ Expected Results:"
echo "  - All tests should pass"
echo "  - Total iterations should be >= 100"
echo "  - Focus should always return to toggle button after Escape"
echo ""

# Try to open in default browser
if command -v open &> /dev/null; then
    # macOS
    open "http://localhost:8084/test-property-14-focus-restoration.html"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "http://localhost:8084/test-property-14-focus-restoration.html"
elif command -v start &> /dev/null; then
    # Windows
    start "http://localhost:8084/test-property-14-focus-restoration.html"
else
    echo "⚠️  Could not automatically open browser"
    echo "   Please manually open: http://localhost:8084/test-property-14-focus-restoration.html"
fi

echo ""
echo "✅ Verification script complete"
