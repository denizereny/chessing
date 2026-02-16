# Implementation Plan: Responsive Settings Menu System

## Overview

This implementation plan transforms the chess application's UI into a fully responsive system with a consolidated settings menu. The approach is incremental: first establish the responsive layout foundation, then build the settings menu component, then integrate existing features, and finally add polish with animations and accessibility.

## Tasks

- [x] 1. Create responsive layout CSS foundation
  - Create `css/responsive-settings-menu.css` with CSS custom properties, breakpoint media queries, and base responsive styles
  - Define three breakpoints: mobile (< 768px), tablet (768-1024px), desktop (≥ 1024px)
  - Add viewport meta tag to HTML if not present
  - _Requirements: 1.1, 1.6, 8.1, 8.2, 8.3_

- [x] 1.1 Write property test for no content overflow
  - **Property 1: No content overflow invariant**
  - **Validates: Requirements 1.1, 1.6**

- [x] 1.2 Write property test for breakpoint-appropriate layout
  - **Property 3: Breakpoint-appropriate layout**
  - **Validates: Requirements 1.3, 1.4, 1.5, 8.1, 8.2, 8.3**

- [x] 2. Implement Responsive Layout Manager
  - [x] 2.1 Create `js/responsive-layout-manager.js` module
    - Implement ResponsiveLayoutManager class with viewport monitoring using ResizeObserver
    - Add breakpoint detection logic
    - Add board size calculation based on available space
    - Implement event emission for breakpoint changes
    - _Requirements: 1.2, 8.4, 8.5_

  - [x] 2.2 Write property test for responsive scaling on resize
    - **Property 2: Responsive scaling on resize**
    - **Validates: Requirements 1.2**

  - [x] 2.3 Write property test for orientation change adaptation
    - **Property 18: Orientation change adaptation**
    - **Validates: Requirements 8.4, 8.5**

  - [x] 2.4 Write property test for layout recalculation performance
    - **Property 16: Layout recalculation performance**
    - **Validates: Requirements 7.2**

- [x] 3. Create settings menu HTML structure
  - Add settings menu toggle button (3-dot icon) to main HTML
  - Add menu panel container with backdrop
  - Add menu content container for controls
  - Structure menu to be accessible (proper semantic HTML)
  - _Requirements: 2.1, 2.6, 2.7_

- [x] 3.1 Write property test for toggle button visibility
  - **Property 4: Toggle button visibility**
  - **Validates: Requirements 2.1**

- [x] 4. Implement Settings Menu Manager
  - [x] 4.1 Create `js/settings-menu-manager.js` module
    - Implement SettingsMenuManager class with open/close/toggle methods
    - Add click handlers for toggle button and backdrop
    - Implement menu state management
    - Add animation coordination
    - _Requirements: 2.2, 2.4, 2.5, 2.7_

  - [x] 4.2 Write property test for menu toggle state transitions
    - **Property 5: Menu toggle state transitions**
    - **Validates: Requirements 2.2, 2.5, 7.1**

  - [x] 4.3 Write property test for click-outside closes menu
    - **Property 6: Click-outside closes menu**
    - **Validates: Requirements 2.4**

  - [x] 4.4 Write property test for menu overlay positioning
    - **Property 7: Menu overlay positioning**
    - **Validates: Requirements 2.6**

  - [x] 4.5 Write property test for menu visibility matches state
    - **Property 8: Menu visibility matches state**
    - **Validates: Requirements 2.7**

- [x] 5. Add CSS animations and transitions
  - Add slide-in/slide-out animations for menu panel
  - Add fade-in/fade-out for backdrop
  - Use CSS transforms for smooth 60fps performance
  - Configure animation duration to 300ms
  - _Requirements: 7.1, 7.3, 7.5_

- [x] 5.1 Write unit test for CSS transforms usage
  - **Example 12: CSS transforms for animation**
  - **Validates: Requirements 7.3**

- [x] 5.2 Write property test for non-blocking animations
  - **Property 17: Non-blocking animations**
  - **Validates: Requirements 7.5**

- [x] 6. Checkpoint - Test basic responsive menu functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Integrate existing features into settings menu
  - [x] 7.1 Move theme toggle into settings menu
    - Relocate theme toggle button/control into menu content container
    - Preserve existing event handlers and functionality
    - _Requirements: 3.1_

  - [x] 7.2 Move language selector into settings menu
    - Relocate language selector dropdown into menu content container
    - Preserve existing event handlers and functionality
    - _Requirements: 3.2_

  - [x] 7.3 Move piece setup controls into settings menu
    - Relocate piece setup button/interface into menu content container
    - Preserve existing event handlers and functionality
    - _Requirements: 3.3_

  - [x] 7.4 Move position sharing controls into settings menu
    - Relocate position sharing controls into menu content container
    - Preserve existing event handlers and functionality
    - _Requirements: 3.4_

  - [x] 7.5 Move analysis controls into settings menu
    - Relocate analysis and evaluation controls into menu content container
    - Preserve existing event handlers and functionality
    - _Requirements: 3.6_

  - [x] 7.6 Verify backend integration still works
    - Test that backend operations function correctly after UI reorganization
    - _Requirements: 3.5_

  - [x] 7.7 Verify move history navigation still works
    - Test that move history and navigation features work correctly
    - _Requirements: 3.7_

- [x] 7.8 Write unit tests for feature preservation
  - **Example 1: All existing features present in menu**
  - **Example 2: Theme system functionality preserved**
  - **Example 3: Language selector functionality preserved**
  - **Example 4: Piece setup functionality preserved**
  - **Example 5: Position sharing functionality preserved**
  - **Example 6: Backend integration functionality preserved**
  - **Example 7: Analysis features preserved**
  - **Example 8: Move history functionality preserved**
  - **Validates: Requirements 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

- [x] 8. Implement touch-friendly enhancements
  - [x] 8.1 Add touch target sizing CSS
    - Ensure all interactive elements in menu are at least 44x44px
    - Add adequate spacing (minimum 8px) between interactive elements
    - Apply touch-friendly sizing on mobile breakpoint
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 8.2 Add touch event handling
    - Add touch event listeners (touchstart, touchend) to interactive elements
    - Provide immediate visual feedback on touch (active states)
    - _Requirements: 4.4, 4.5_

  - [x] 8.3 Write property test for touch target minimum size
    - **Property 9: Touch target minimum size**
    - **Validates: Requirements 4.1, 4.2**

  - [x] 8.4 Write property test for touch target spacing
    - **Property 10: Touch target spacing**
    - **Validates: Requirements 4.3**

  - [x] 8.5 Write property test for touch event responsiveness
    - **Property 11: Touch event responsiveness**
    - **Validates: Requirements 4.4, 4.5**

- [x] 9. Implement keyboard navigation and accessibility
  - [x] 9.1 Add keyboard event handlers
    - Implement Tab navigation within menu
    - Implement Enter to activate controls
    - Implement Escape to close menu
    - _Requirements: 6.2_

  - [x] 9.2 Implement focus trapping
    - When menu opens, trap focus within menu elements
    - Cycle focus among menu controls with Tab
    - _Requirements: 6.3_

  - [x] 9.3 Implement focus restoration
    - When menu closes via Escape, return focus to toggle button
    - _Requirements: 6.4_

  - [x] 9.4 Add ARIA attributes
    - Add aria-label to toggle button
    - Add aria-expanded to toggle button (updates with menu state)
    - Add aria-controls linking toggle to menu panel
    - Add aria-hidden to menu panel (updates with menu state)
    - Add aria-live region for menu state announcements
    - _Requirements: 6.1, 6.5, 6.7_

  - [x] 9.5 Write property test for keyboard navigation
    - **Property 12: Keyboard navigation**
    - **Validates: Requirements 6.2**

  - [x] 9.6 Write property test for focus trapping
    - **Property 13: Focus trapping when menu open**
    - **Validates: Requirements 6.3**

  - [x] 9.7 Write property test for focus restoration
    - **Property 14: Focus restoration on close**
    - **Validates: Requirements 6.4**

  - [x] 9.8 Write unit tests for ARIA attributes
    - **Example 9: ARIA labels on toggle button**
    - **Example 10: ARIA attributes on menu**
    - **Example 11: Screen reader announcements**
    - **Validates: Requirements 6.1, 6.5, 6.7**

- [x] 10. Verify color contrast and visual accessibility
  - [x] 10.1 Audit color contrast ratios
    - Calculate contrast ratios for all text and controls
    - Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
    - Adjust colors if needed to meet standards
    - _Requirements: 6.6_

  - [x] 10.2 Write property test for color contrast compliance
    - **Property 15: Color contrast compliance**
    - **Validates: Requirements 6.6**

- [x] 11. Implement error handling and fallbacks
  - Add ResizeObserver fallback (use window.resize with debouncing)
  - Add CSS transition fallback (apply final state immediately)
  - Add touch event fallback (use mouse events)
  - Add debouncing for rapid toggle clicks
  - Add validation for viewport dimensions
  - _Requirements: 5.5, 5.6_

- [x] 12. Optimize board visibility and sizing
  - [x] 12.1 Implement board size calculation logic
    - Calculate optimal board size based on available viewport space
    - Prioritize board visibility at all breakpoints
    - Apply calculated dimensions to board element
    - _Requirements: 8.6_

  - [x] 12.2 Write property test for board visibility priority
    - **Property 19: Board visibility priority**
    - **Validates: Requirements 8.6**

- [x] 13. Integration and wiring
  - [x] 13.1 Initialize responsive system on page load
    - Create ResponsiveLayoutManager instance
    - Create SettingsMenuManager instance
    - Wire up event listeners and callbacks
    - Apply initial layout based on current viewport
    - _Requirements: All_

  - [x] 13.2 Update main HTML file
    - Include new CSS file (responsive-settings-menu.css)
    - Include new JS modules (responsive-layout-manager.js, settings-menu-manager.js)
    - Add initialization code
    - _Requirements: All_

  - [x] 13.3 Write integration tests
    - Test responsive system initialization
    - Test menu system initialization
    - Test interaction between responsive layout and menu
    - Test all existing features work together
    - _Requirements: All_

- [x] 14. Final checkpoint - Comprehensive testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Manual cross-browser and device testing required after implementation
