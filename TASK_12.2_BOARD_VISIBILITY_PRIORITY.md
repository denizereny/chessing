# Task 12.2: Board Visibility Priority Property Test

## Overview

This document describes the implementation of Property 19: Board Visibility Priority property-based tests for the responsive settings menu system.

**Task**: 12.2 Write property test for board visibility priority  
**Property**: 19 - Board visibility priority  
**Validates**: Requirements 8.6  
**Status**: ✅ Complete

## Requirement 8.6

**User Story**: As a user on different devices, I want the layout to intelligently adapt to my screen, so that I get the best experience for my device type.

**Acceptance Criteria 8.6**: THE Responsive_Layout SHALL prioritize chess board visibility at all Breakpoints

## Property 19: Board Visibility Priority

**Property Statement**: *For any* viewport size and breakpoint, the chess board should be visible and occupy the largest proportion of available space compared to other UI elements.

This property ensures that:
1. The board is always the largest single UI element
2. The board occupies a significant percentage of the viewport
3. The board is not obscured by other elements
4. The board scales appropriately across different viewport sizes

## Implementation

### Test File Location

- **Property Tests**: `test/responsive-settings-menu-properties.test.js`
- **Test Runner HTML**: `test-property-19-board-visibility.html`
- **Node.js Runner**: `run-property-19-tests.js`

### Test Structure

The Property 19 test suite includes 8 comprehensive property-based tests:

#### 1. Board is Largest UI Element
Tests that the board has a larger area than any other individual UI element across all viewport sizes.

```javascript
test('Board should be the largest UI element for any viewport size', () => {
  fc.assert(fc.property(
    viewportDimensionsGenerator,
    (viewport) => {
      // Verify board area > any UI element area
    }
  ), { numRuns: 100 });
});
```

#### 2. Mobile Viewport Coverage (≥50%)
Tests that the board occupies at least 50% of the viewport on mobile devices (width < 768px).

```javascript
test('Board should occupy at least 50% of mobile viewport', () => {
  fc.assert(fc.property(
    mobileWidthGenerator,
    fc.integer({ min: 480, max: 1440 }),
    (width, height) => {
      // Verify boardArea / viewportArea >= 0.50
    }
  ), { numRuns: 100 });
});
```

#### 3. Tablet Viewport Coverage (≥40%)
Tests that the board occupies at least 40% of the viewport on tablet devices (768px ≤ width < 1024px).

```javascript
test('Board should occupy at least 40% of tablet viewport', () => {
  fc.assert(fc.property(
    tabletWidthGenerator,
    fc.integer({ min: 480, max: 1440 }),
    (width, height) => {
      // Verify boardArea / viewportArea >= 0.40
    }
  ), { numRuns: 100 });
});
```

#### 4. Desktop Viewport Coverage (≥30%)
Tests that the board occupies at least 30% of the viewport on desktop devices (width ≥ 1024px).

```javascript
test('Board should occupy at least 30% of desktop viewport', () => {
  fc.assert(fc.property(
    desktopWidthGenerator,
    fc.integer({ min: 480, max: 1440 }),
    (width, height) => {
      // Verify boardArea / viewportArea >= 0.30
    }
  ), { numRuns: 100 });
});
```

#### 5. Board Larger Than Settings Menu
Tests that when the settings menu is open, the board still has a larger area than the menu.

```javascript
test('Board should be larger than settings menu when menu is open', () => {
  fc.assert(fc.property(
    viewportDimensionsGenerator,
    (viewport) => {
      // Verify boardArea > menuArea
    }
  ), { numRuns: 100 });
});
```

#### 6. Board Larger Than Individual Controls
Tests that the board is larger than any individual control element (buttons, panels, etc.).

```javascript
test('Board should be larger than any individual control element', () => {
  fc.assert(fc.property(
    viewportDimensionsGenerator,
    (viewport) => {
      // Verify boardArea > controlArea for all controls
    }
  ), { numRuns: 100 });
});
```

#### 7. Proportional Scaling
Tests that the board area scales proportionally with viewport size changes.

```javascript
test('Board area should increase proportionally with viewport size', () => {
  fc.assert(fc.property(
    fc.integer({ min: 320, max: 1280 }),
    fc.integer({ min: 480, max: 1440 }),
    fc.integer({ min: 320, max: 1280 }),
    fc.integer({ min: 480, max: 1440 }),
    (width1, height1, width2, height2) => {
      // Verify board proportion remains consistent
    }
  ), { numRuns: 100 });
});
```

#### 8. Board Visibility
Tests that the board is fully visible within the viewport and not obscured.

```javascript
test('Board should be visible and not obscured by other elements', () => {
  fc.assert(fc.property(
    viewportDimensionsGenerator,
    (viewport) => {
      // Verify board is within viewport bounds
    }
  ), { numRuns: 100 });
});
```

## Test Generators

### Viewport Dimensions Generator
```javascript
const viewportDimensionsGenerator = fc.record({
  width: fc.integer({ min: 320, max: 2560 }),
  height: fc.integer({ min: 480, max: 1440 })
});
```

### Breakpoint-Specific Generators
```javascript
const mobileWidthGenerator = fc.integer({ min: 320, max: 767 });
const tabletWidthGenerator = fc.integer({ min: 768, max: 1023 });
const desktopWidthGenerator = fc.integer({ min: 1024, max: 2560 });
```

## Helper Functions

### getBoardElement()
Finds the board element using multiple selectors:
- `.board-container`
- `#board`
- `.chessboard`
- `.board`

### calculateElementArea(element)
Calculates the area of an element in square pixels using `getBoundingClientRect()`.

### checkBoardVisibilityPriority(viewportWidth, viewportHeight)
Main validation function that:
1. Gets the board element
2. Calculates board area
3. Compares with all UI elements
4. Verifies minimum viewport coverage percentages
5. Returns true if all checks pass

## Running the Tests

### Option 1: Browser Testing (Recommended)
```bash
# Open in browser
open test-property-19-board-visibility.html
```

### Option 2: Live Server
```bash
# Install live-server globally
npm install -g live-server

# Run with auto-open
live-server --open=test-property-19-board-visibility.html
```

### Option 3: Python HTTP Server
```bash
# Start server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000/test-property-19-board-visibility.html
```

### Option 4: Node.js HTTP Server
```bash
# Run with npx
npx http-server -o test-property-19-board-visibility.html
```

## Test Configuration

- **Testing Library**: fast-check (property-based testing)
- **Test Framework**: Jasmine 4.5.0
- **Iterations per Test**: 100 runs
- **Viewport Range**: 320px - 2560px width, 480px - 1440px height
- **Breakpoints Tested**: Mobile, Tablet, Desktop

## Expected Results

All 8 property tests should pass, validating that:

✅ Board is the largest UI element across all viewport sizes  
✅ Board occupies ≥50% of mobile viewport  
✅ Board occupies ≥40% of tablet viewport  
✅ Board occupies ≥30% of desktop viewport  
✅ Board is larger than settings menu when open  
✅ Board is larger than any individual control  
✅ Board scales proportionally with viewport  
✅ Board is visible and not obscured  

## Integration with Responsive Layout Manager

The tests validate the behavior of the `ResponsiveLayoutManager` class, specifically:

- `calculateBoardSize()` - Calculates optimal board dimensions
- `applyBoardSize()` - Applies calculated dimensions to board element
- `calculateUIOverhead()` - Accounts for UI elements taking space
- Breakpoint-specific sizing percentages (95% mobile, 80% tablet, 70% desktop)

## Design Document Alignment

These tests validate the design specifications from `design.md`:

**Breakpoint Configuration**:
```javascript
const BREAKPOINTS = {
  mobile: {
    maxWidth: 767,
    boardSizePercent: 95,  // Tested: ≥50% actual coverage
  },
  tablet: {
    minWidth: 768,
    maxWidth: 1023,
    boardSizePercent: 80,  // Tested: ≥40% actual coverage
  },
  desktop: {
    minWidth: 1024,
    boardSizePercent: 70,  // Tested: ≥30% actual coverage
  }
}
```

## Validation Strategy

The tests use a **dual validation approach**:

1. **Comparative Validation**: Board area compared to other UI elements
2. **Absolute Validation**: Board coverage as percentage of viewport

This ensures both relative priority (largest element) and absolute visibility (sufficient coverage).

## Tolerance and Thresholds

- **Minimum Coverage**: 50% mobile, 40% tablet, 30% desktop
- **Proportional Scaling Tolerance**: ±30% (accounts for breakpoint changes)
- **Element Comparison**: Strict (board must be larger than any single element)

## Success Criteria

✅ All 8 property tests pass with 100 iterations each  
✅ Tests validate across 800+ random viewport configurations  
✅ Board visibility priority maintained at all breakpoints  
✅ Integration with ResponsiveLayoutManager verified  

## Conclusion

Property 19 tests comprehensively validate that the chess board maintains visibility priority across all viewport sizes and breakpoints, ensuring an optimal user experience on mobile, tablet, and desktop devices.

The property-based testing approach with 100 iterations per test provides high confidence that the board visibility requirement (8.6) is satisfied across the entire input space of possible viewport configurations.
