# Adaptive Viewport Optimizer

## Overview

The Adaptive Viewport Optimizer is a system that dynamically analyzes viewport dimensions and element visibility to automatically reposition UI elements when they overflow horizontally. The system detects elements that are not visible due to screen size constraints and repositions them vertically with scrolling support.

## Directory Structure

```
js/adaptive-viewport/
├── README.md                 # This file
├── base-component.js         # Base class for all components
├── constants.js              # Centralized configuration constants
├── error-handler.js          # Error handling and fallback strategies
├── types.js                  # Type definitions and validation utilities
├── visibility-detector.js    # (To be implemented in task 2)
├── layout-optimizer.js       # (To be implemented in task 3)
├── overflow-handler.js       # (To be implemented in task 5)
├── dom-updater.js           # (To be implemented in task 6)
├── layout-state-manager.js  # (To be implemented in task 7)
├── viewport-analyzer.js     # (To be implemented in task 8)
└── adaptive-viewport-system.js  # (To be implemented in task 14)

test/adaptive-viewport/
├── setup-fast-check.js      # Fast-check setup and custom generators
└── [property test files]    # (To be implemented in subsequent tasks)
```

## Core Infrastructure

### BaseComponent

Base class providing common functionality for all components:
- Initialization and destruction lifecycle
- Event listener management with automatic cleanup
- Configuration management
- Debounce and throttle utilities
- Logging utilities

**Usage:**
```javascript
class MyComponent extends BaseComponent {
  constructor(config) {
    super(config);
  }
  
  async initialize() {
    await super.initialize();
    // Component-specific initialization
  }
  
  destroy() {
    // Component-specific cleanup
    super.destroy();
  }
}
```

### Constants

Centralized configuration values:
- Viewport dimension constraints (320-3840px width, 480-2160px height)
- Board constraints (minimum 280px)
- Layout constraints (16px minimum spacing)
- Performance thresholds (100-200ms)
- Animation settings
- Error handling configuration

**Usage:**
```javascript
const { VIEWPORT, BOARD, LAYOUT } = AdaptiveViewportConstants;
console.log(VIEWPORT.MIN_WIDTH); // 320
console.log(BOARD.MIN_SIZE);     // 280
console.log(LAYOUT.MIN_SPACING); // 16
```

### ErrorHandler

Handles errors and provides fallback strategies:
- Error categorization (API, calculation, DOM, performance)
- Fallback strategies for each error type
- Error logging and statistics
- Graceful degradation

**Usage:**
```javascript
const errorHandler = new ErrorHandler();

try {
  // Some operation
} catch (error) {
  const fallback = errorHandler.handleError(error, 'context');
  // Use fallback configuration
}
```

### Types and Validation

Type definitions (JSDoc) and validation utilities:
- ViewportDimensions
- Position
- VisibilityStatus
- LayoutConfiguration
- ValidationUtils for position and dimension validation

**Usage:**
```javascript
const { ValidationUtils } = require('./types.js');

const position = { x: 10, y: 20, width: 100, height: 50 };
if (ValidationUtils.isValidPosition(position)) {
  // Position is valid
}
```

## Property-Based Testing Setup

### Fast-check Integration

The system uses fast-check for property-based testing. Include in test HTML files:

```html
<script src="https://cdn.jsdelivr.net/npm/fast-check@3.13.0/lib/bundle.js"></script>
<script src="../test/adaptive-viewport/setup-fast-check.js"></script>
```

### Custom Generators

Available generators for property-based tests:
- `viewportDimensions()` - Generate valid viewport dimensions
- `elementPosition()` - Generate element positions (can be outside viewport)
- `validPosition(width, height)` - Generate positions within viewport
- `boardDimensions()` - Generate board dimensions
- `layoutStrategy()` - Generate layout strategies
- `elementMetadata()` - Generate element metadata
- `extremeViewport()` - Generate extreme viewport dimensions
- `resizeSequence()` - Generate resize event sequences

**Usage:**
```javascript
const { AdaptiveViewportGenerators } = AdaptiveViewportTestUtils;

fc.assert(
  fc.property(
    AdaptiveViewportGenerators.viewportDimensions(),
    AdaptiveViewportGenerators.elementPosition(),
    (viewport, element) => {
      // Test property
    }
  ),
  { numRuns: 100 }
);
```

### Test Utilities

Helper functions for property-based tests:
- `intersectsViewport(element, viewport)` - Check element-viewport intersection
- `isValidPosition(position)` - Validate position object
- `isWithinViewport(position, viewport)` - Check if position is within viewport
- `calculateSpacing(pos1, pos2)` - Calculate spacing between positions
- `createMockElement(config)` - Create mock DOM element for testing

## Requirements Mapping

This infrastructure supports the following requirements:

- **Requirement 10.1**: Error handling for API unavailability
- **Requirement 10.2**: Safe default layout fallback
- **Requirement 10.3**: Error logging and continuation
- **Requirement 10.4**: Position validation
- **Requirement 10.5**: State management for error recovery

## Next Steps

The following components will be implemented in subsequent tasks:

1. **Task 2**: VisibilityDetector - Detect element visibility using Intersection Observer
2. **Task 3**: LayoutOptimizer - Calculate optimal layout configurations
3. **Task 4**: Board priority and sizing logic
4. **Task 5**: OverflowHandler - Handle vertical stacking and scrolling
5. **Task 6**: DOMUpdater - Apply layout changes to DOM
6. **Task 7**: LayoutStateManager - Manage layout state and caching
7. **Task 8**: ViewportAnalyzer - Coordinate all components
8. **Task 14**: AdaptiveViewportSystem - Main system coordinator

## Testing

Each component will have:
- Unit tests for specific examples
- Property-based tests for universal properties
- Integration tests with existing features

Minimum 100 iterations per property test.

## Browser Compatibility

- Modern browsers with Intersection Observer support
- Fallback to viewport dimension calculations for older browsers
- ResizeObserver polyfill if needed
- requestAnimationFrame with setTimeout fallback

## Performance

- Debounced resize events (150ms)
- Cached element dimensions
- RAF-batched DOM updates
- Early exit for minimal viewport changes (<10px)
- Layout calculation timeout: 100ms
- Initial optimization timeout: 200ms
