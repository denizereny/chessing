/**
 * Validation script for VisibilityDetector implementation
 * Checks that all required methods and functionality are present
 */

console.log('=== VisibilityDetector Implementation Validation ===\n');

// Check if file exists
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../js/adaptive-viewport/visibility-detector.js');

if (!fs.existsSync(filePath)) {
  console.error('❌ VisibilityDetector file not found!');
  process.exit(1);
}

console.log('✓ VisibilityDetector file exists');

// Read file content
const content = fs.readFileSync(filePath, 'utf8');

// Check for required components
const requiredComponents = [
  { name: 'Constructor', pattern: /constructor\s*\(elements\s*=\s*\[\],\s*options\s*=\s*\{\}\)/ },
  { name: 'Configuration options (threshold)', pattern: /this\.threshold/ },
  { name: 'Configuration options (rootMargin)', pattern: /this\.rootMargin/ },
  { name: 'Intersection Observer setup', pattern: /new IntersectionObserver/ },
  { name: 'observe method', pattern: /observe\s*\(element\)/ },
  { name: 'unobserve method', pattern: /unobserve\s*\(element\)/ },
  { name: 'Visibility status map', pattern: /this\.visibilityMap/ },
  { name: 'getVisibilityMap method', pattern: /getVisibilityMap\s*\(\)/ },
  { name: 'getInvisibleElements method', pattern: /getInvisibleElements\s*\(\)/ },
  { name: 'Callback system', pattern: /this\.callbacks/ },
  { name: 'onVisibilityChange method', pattern: /onVisibilityChange\s*\(callback\)/ },
  { name: 'Visibility change notifications', pattern: /_triggerCallbacks/ },
  { name: 'destroy method', pattern: /destroy\s*\(\)/ },
  { name: 'Fallback for missing API', pattern: /_useFallbackMethod/ },
  { name: 'Visibility reason determination', pattern: /_determineVisibilityReason/ }
];

let allPassed = true;

console.log('\nChecking required components:\n');

requiredComponents.forEach(component => {
  if (component.pattern.test(content)) {
    console.log(`✓ ${component.name}`);
  } else {
    console.log(`❌ ${component.name} - NOT FOUND`);
    allPassed = false;
  }
});

// Check for Requirements references
console.log('\nChecking Requirements coverage:\n');

const requirements = ['1.1', '1.2', '1.3', '1.4', '1.5'];
requirements.forEach(req => {
  if (content.includes(req)) {
    console.log(`✓ Requirement ${req} referenced`);
  } else {
    console.log(`⚠ Requirement ${req} not explicitly referenced`);
  }
});

// Check for proper error handling
console.log('\nChecking error handling:\n');

const errorHandling = [
  { name: 'Invalid element handling', pattern: /Invalid element/ },
  { name: 'IntersectionObserver not supported', pattern: /IntersectionObserver not supported/ },
  { name: 'Try-catch blocks', pattern: /try\s*\{[\s\S]*?\}\s*catch/ }
];

errorHandling.forEach(check => {
  if (check.pattern.test(content)) {
    console.log(`✓ ${check.name}`);
  } else {
    console.log(`⚠ ${check.name} - not found`);
  }
});

// Check for additional useful methods
console.log('\nChecking additional methods:\n');

const additionalMethods = [
  { name: 'getVisibleElements', pattern: /getVisibleElements\s*\(\)/ },
  { name: 'getVisibilityStatus', pattern: /getVisibilityStatus\s*\(element\)/ },
  { name: 'isVisible', pattern: /isVisible\s*\(element\)/ },
  { name: 'offVisibilityChange', pattern: /offVisibilityChange\s*\(callback\)/ },
  { name: 'refresh', pattern: /refresh\s*\(\)/ }
];

additionalMethods.forEach(method => {
  if (method.pattern.test(content)) {
    console.log(`✓ ${method.name}`);
  } else {
    console.log(`⚠ ${method.name} - not found (optional)`);
  }
});

// Summary
console.log('\n=== Validation Summary ===\n');

if (allPassed) {
  console.log('✅ All required components are implemented!');
  console.log('✅ VisibilityDetector is ready for testing');
  process.exit(0);
} else {
  console.log('❌ Some required components are missing');
  console.log('Please review the implementation');
  process.exit(1);
}
