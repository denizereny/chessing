#!/usr/bin/env node

/**
 * Node.js test runner for visibility classification property tests
 * This runner uses JSDOM to simulate browser environment
 */

const fs = require('fs');
const path = require('path');

// Check if fast-check is installed
let fc;
try {
  fc = require('fast-check');
} catch (e) {
  console.error('Error: fast-check is not installed');
  console.error('Please install it with: npm install fast-check');
  process.exit(1);
}

// Check if jsdom is installed
let jsdom;
try {
  jsdom = require('jsdom');
} catch (e) {
  console.error('Error: jsdom is not installed');
  console.error('Please install it with: npm install jsdom');
  process.exit(1);
}

const { JSDOM } = jsdom;

// Create a DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.Element = dom.window.Element;
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options || {};
    this.elements = new Map();
  }
  
  observe(element) {
    // Simulate intersection observation
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth || 1024;
    const viewportHeight = window.innerHeight || 768;
    
    // Check if element intersects viewport
    const isIntersecting = (
      rect.left < viewportWidth &&
      rect.right > 0 &&
      rect.top < viewportHeight &&
      rect.bottom > 0
    );
    
    const intersectionRatio = isIntersecting ? 1.0 : 0.0;
    
    this.elements.set(element, { isIntersecting, intersectionRatio });
    
    // Trigger callback asynchronously
    setTimeout(() => {
      this.callback([{
        target: element,
        isIntersecting,
        intersectionRatio,
        boundingClientRect: rect,
        intersectionRect: isIntersecting ? rect : null,
        rootBounds: {
          left: 0,
          top: 0,
          right: viewportWidth,
          bottom: viewportHeight,
          width: viewportWidth,
          height: viewportHeight
        }
      }]);
    }, 0);
  }
  
  unobserve(element) {
    this.elements.delete(element);
  }
  
  disconnect() {
    this.elements.clear();
  }
};

// Set viewport size
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768
});

// Load the VisibilityDetector
const VisibilityDetector = require('../../js/adaptive-viewport/visibility-detector.js');

// Load the test
const { runVisibilityClassificationPropertyTest } = require('./visibility-classification-property.test.js');

// Run the tests
console.log('Starting property-based tests in Node.js environment...');
console.log(`Simulated viewport: ${window.innerWidth}px × ${window.innerHeight}px\n`);

runVisibilityClassificationPropertyTest(fc)
  .then(results => {
    console.log('\n=== Final Results ===');
    console.log(`Total Properties Tested: ${results.passed + results.failed}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    
    if (results.failed === 0) {
      console.log('\n✅ All property tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some property tests failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  });
