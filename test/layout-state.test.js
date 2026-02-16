/**
 * Unit Tests for LayoutState Class
 * 
 * Tests the LayoutState class functionality including:
 * - State initialization
 * - Profile updates
 * - State queries
 * - Manual override tracking
 * - Transition state management
 * 
 * Requirements: 2.3 (Game State Preservation), 7.1 (Manual Override)
 * Task: 1.3 Implement LayoutState class for state management
 */

describe('LayoutState', function() {
    let mockProfile1, mockProfile2;

    beforeEach(function() {
        // Create mock device profiles for testing
        mockProfile1 = {
            type: 'desktop',
            name: 'Desktop',
            dimensions: { minWidth: 1024, maxWidth: 9999, breakpoint: 1024 },
            scaling: { boardSize: 600, fontSize: 16, buttonSize: 40, panelWidth: 300, spacing: 1 }
        };

        mockProfile2 = {
            type: 'mobile',
            name: 'Mobile',
            dimensions: { minWidth: 0, maxWidth: 767, breakpoint: 375 },
            scaling: { boardSize: 320, fontSize: 14, buttonSize: 44, panelWidth: 100, spacing: 0.8 }
        };
    });

    describe('Constructor', function() {
        it('should initialize with null current profile', function() {
            const state = new LayoutState();
            
            expect(state.getCurrentProfile()).toBeNull();
        });

        it('should initialize with null previous profile', function() {
            const state = new LayoutState();
            
            expect(state.getPreviousProfile()).toBeNull();
        });

        it('should initialize with manual override as false', function() {
            const state = new LayoutState();
            
            expect(state.isManual()).toBe(false);
        });

        it('should initialize with transitioning as false', function() {
            const state = new LayoutState();
            
            expect(state.isInTransition()).toBe(false);
        });

        it('should initialize with null current type', function() {
            const state = new LayoutState();
            
            expect(state.getCurrentType()).toBeNull();
        });
    });

    describe('updateProfile()', function() {
        it('should set current profile', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            
            expect(state.getCurrentProfile()).toBe(mockProfile1);
        });

        it('should set manual override flag when isManual is true', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1, true);
            
            expect(state.isManual()).toBe(true);
        });

        it('should not set manual override flag when isManual is false', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1, false);
            
            expect(state.isManual()).toBe(false);
        });

        it('should default isManual to false when not provided', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            
            expect(state.isManual()).toBe(false);
        });

        it('should move current profile to previous when updating', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            state.updateProfile(mockProfile2);
            
            expect(state.getPreviousProfile()).toBe(mockProfile1);
            expect(state.getCurrentProfile()).toBe(mockProfile2);
        });

        it('should handle multiple profile updates', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            state.updateProfile(mockProfile2);
            state.updateProfile(mockProfile1);
            
            expect(state.getCurrentProfile()).toBe(mockProfile1);
            expect(state.getPreviousProfile()).toBe(mockProfile2);
        });

        it('should preserve manual override flag across updates', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1, true);
            state.updateProfile(mockProfile2, true);
            
            expect(state.isManual()).toBe(true);
        });

        it('should allow changing manual override flag', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1, true);
            state.updateProfile(mockProfile2, false);
            
            expect(state.isManual()).toBe(false);
        });
    });

    describe('hasChanged()', function() {
        it('should return false when no profile has been set', function() {
            const state = new LayoutState();
            
            expect(state.hasChanged()).toBe(false);
        });

        it('should return true after first profile update', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            
            expect(state.hasChanged()).toBe(true);
        });

        it('should return true when profile changes', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            state.updateProfile(mockProfile2);
            
            expect(state.hasChanged()).toBe(true);
        });

        it('should return false when same profile is set again', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            state.updateProfile(mockProfile1);
            
            expect(state.hasChanged()).toBe(false);
        });
    });

    describe('getCurrentType()', function() {
        it('should return null when no profile is set', function() {
            const state = new LayoutState();
            
            expect(state.getCurrentType()).toBeNull();
        });

        it('should return desktop type for desktop profile', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            
            expect(state.getCurrentType()).toBe('desktop');
        });

        it('should return mobile type for mobile profile', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile2);
            
            expect(state.getCurrentType()).toBe('mobile');
        });

        it('should return updated type after profile change', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            expect(state.getCurrentType()).toBe('desktop');
            
            state.updateProfile(mockProfile2);
            expect(state.getCurrentType()).toBe('mobile');
        });
    });

    describe('getCurrentProfile()', function() {
        it('should return null initially', function() {
            const state = new LayoutState();
            
            expect(state.getCurrentProfile()).toBeNull();
        });

        it('should return the current profile after update', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            
            expect(state.getCurrentProfile()).toBe(mockProfile1);
        });

        it('should return the most recent profile', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            state.updateProfile(mockProfile2);
            
            expect(state.getCurrentProfile()).toBe(mockProfile2);
        });
    });

    describe('getPreviousProfile()', function() {
        it('should return null initially', function() {
            const state = new LayoutState();
            
            expect(state.getPreviousProfile()).toBeNull();
        });

        it('should return null after first profile update', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            
            expect(state.getPreviousProfile()).toBeNull();
        });

        it('should return previous profile after second update', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            state.updateProfile(mockProfile2);
            
            expect(state.getPreviousProfile()).toBe(mockProfile1);
        });
    });

    describe('isManual()', function() {
        it('should return false initially', function() {
            const state = new LayoutState();
            
            expect(state.isManual()).toBe(false);
        });

        it('should return true when manual override is set', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1, true);
            
            expect(state.isManual()).toBe(true);
        });

        it('should return false when automatic detection is used', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1, false);
            
            expect(state.isManual()).toBe(false);
        });
    });

    describe('setTransitioning()', function() {
        it('should set transitioning to true', function() {
            const state = new LayoutState();
            state.setTransitioning(true);
            
            expect(state.isInTransition()).toBe(true);
        });

        it('should set transitioning to false', function() {
            const state = new LayoutState();
            state.setTransitioning(true);
            state.setTransitioning(false);
            
            expect(state.isInTransition()).toBe(false);
        });

        it('should allow multiple transitions', function() {
            const state = new LayoutState();
            state.setTransitioning(true);
            state.setTransitioning(false);
            state.setTransitioning(true);
            
            expect(state.isInTransition()).toBe(true);
        });
    });

    describe('isInTransition()', function() {
        it('should return false initially', function() {
            const state = new LayoutState();
            
            expect(state.isInTransition()).toBe(false);
        });

        it('should return true when transition is active', function() {
            const state = new LayoutState();
            state.setTransitioning(true);
            
            expect(state.isInTransition()).toBe(true);
        });

        it('should return false after transition completes', function() {
            const state = new LayoutState();
            state.setTransitioning(true);
            state.setTransitioning(false);
            
            expect(state.isInTransition()).toBe(false);
        });
    });

    describe('clearManualOverride()', function() {
        it('should clear manual override flag', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1, true);
            state.clearManualOverride();
            
            expect(state.isManual()).toBe(false);
        });

        it('should not affect current profile', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1, true);
            state.clearManualOverride();
            
            expect(state.getCurrentProfile()).toBe(mockProfile1);
        });

        it('should not affect previous profile', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1, true);
            state.updateProfile(mockProfile2, true);
            state.clearManualOverride();
            
            expect(state.getPreviousProfile()).toBe(mockProfile1);
        });

        it('should work when manual override is already false', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1, false);
            state.clearManualOverride();
            
            expect(state.isManual()).toBe(false);
        });
    });

    describe('reset()', function() {
        it('should reset current profile to null', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1, true);
            state.reset();
            
            expect(state.getCurrentProfile()).toBeNull();
        });

        it('should reset previous profile to null', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            state.updateProfile(mockProfile2);
            state.reset();
            
            expect(state.getPreviousProfile()).toBeNull();
        });

        it('should reset manual override to false', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1, true);
            state.reset();
            
            expect(state.isManual()).toBe(false);
        });

        it('should reset transitioning to false', function() {
            const state = new LayoutState();
            state.setTransitioning(true);
            state.reset();
            
            expect(state.isInTransition()).toBe(false);
        });

        it('should reset current type to null', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1);
            state.reset();
            
            expect(state.getCurrentType()).toBeNull();
        });

        it('should allow reuse after reset', function() {
            const state = new LayoutState();
            state.updateProfile(mockProfile1, true);
            state.reset();
            state.updateProfile(mockProfile2, false);
            
            expect(state.getCurrentProfile()).toBe(mockProfile2);
            expect(state.isManual()).toBe(false);
        });
    });

    describe('Integration scenarios', function() {
        it('should handle manual selection workflow', function() {
            const state = new LayoutState();
            
            // User manually selects desktop
            state.updateProfile(mockProfile1, true);
            expect(state.getCurrentType()).toBe('desktop');
            expect(state.isManual()).toBe(true);
            
            // User changes to mobile
            state.updateProfile(mockProfile2, true);
            expect(state.getCurrentType()).toBe('mobile');
            expect(state.getPreviousProfile()).toBe(mockProfile1);
            expect(state.isManual()).toBe(true);
        });

        it('should handle automatic detection workflow', function() {
            const state = new LayoutState();
            
            // Automatic detection sets desktop
            state.updateProfile(mockProfile1, false);
            expect(state.getCurrentType()).toBe('desktop');
            expect(state.isManual()).toBe(false);
            
            // Window resizes, automatic detection changes to mobile
            state.updateProfile(mockProfile2, false);
            expect(state.getCurrentType()).toBe('mobile');
            expect(state.isManual()).toBe(false);
        });

        it('should handle transition from automatic to manual', function() {
            const state = new LayoutState();
            
            // Start with automatic detection
            state.updateProfile(mockProfile1, false);
            expect(state.isManual()).toBe(false);
            
            // User manually overrides
            state.updateProfile(mockProfile2, true);
            expect(state.isManual()).toBe(true);
        });

        it('should handle transition from manual to automatic', function() {
            const state = new LayoutState();
            
            // Start with manual selection
            state.updateProfile(mockProfile1, true);
            expect(state.isManual()).toBe(true);
            
            // User clears preference, revert to automatic
            state.clearManualOverride();
            state.updateProfile(mockProfile2, false);
            expect(state.isManual()).toBe(false);
        });

        it('should track transition state during layout change', function() {
            const state = new LayoutState();
            
            // Start transition
            state.setTransitioning(true);
            expect(state.isInTransition()).toBe(true);
            
            // Apply new profile during transition
            state.updateProfile(mockProfile1, true);
            expect(state.isInTransition()).toBe(true);
            
            // Complete transition
            state.setTransitioning(false);
            expect(state.isInTransition()).toBe(false);
        });
    });
});
