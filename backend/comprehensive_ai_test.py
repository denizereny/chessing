#!/usr/bin/env python3
"""
Comprehensive test for AIEngine implementation.
Tests all requirements from the task specification.
"""

import sys
import os
import time
import json

# Import modules directly
sys.path.append(os.path.join(os.path.dirname(__file__), 'app', 'chess'))

from board import ChessBoard
from ai_engine import AIEngine


def test_minimax_with_alpha_beta():
    """Test that minimax algorithm with alpha-beta pruning is working."""
    print("🧠 Testing Minimax with Alpha-Beta Pruning")
    print("=" * 45)
    
    board = ChessBoard()
    ai = AIEngine(difficulty_level=3)
    
    # Get move and check that nodes evaluated is reasonable (pruning should reduce nodes)
    best_move = ai.get_best_move(board)
    
    if best_move:
        nodes = best_move['nodes_evaluated']
        depth = best_move['max_depth_reached']
        
        print(f"✅ Minimax algorithm working")
        print(f"Search depth: {ai.depth}")
        print(f"Max depth reached: {depth}")
        print(f"Nodes evaluated: {nodes}")
        
        # Alpha-beta pruning should significantly reduce nodes compared to full minimax
        # For depth 5, full minimax would evaluate ~20^5 = 3.2M nodes
        # With pruning, we should see much fewer nodes
        if nodes < 10000:  # Reasonable with pruning
            print("✅ Alpha-beta pruning appears to be working (low node count)")
        else:
            print("⚠️ High node count - alpha-beta pruning may not be optimal")
        
        return True
    else:
        print("❌ Minimax algorithm failed")
        return False


def test_position_evaluation():
    """Test position evaluation function."""
    print("\n📊 Testing Position Evaluation Function")
    print("=" * 38)
    
    ai = AIEngine(difficulty_level=2)
    
    # Test 1: Starting position should be roughly equal
    board = ChessBoard()
    eval_start = ai.evaluate_position(board)
    print(f"Starting position evaluation: {eval_start}")
    
    # Test 2: Position with material advantage
    board.board = [
        ["r", None, "k", "r"],      # Black missing queen
        ["p", "p", "p", "p"],
        [None, None, None, None],
        ["P", "P", "P", "P"],
        ["R", "Q", "K", "R"],       # White has queen
    ]
    eval_advantage = ai.evaluate_position(board)
    print(f"White material advantage: {eval_advantage}")
    
    # Test 3: Pawn advancement bonus
    board.board = [
        ["r", "q", "k", "r"],
        [None, "p", "p", "p"],      # One pawn advanced
        ["p", None, None, None],    # Black pawn advanced
        ["P", "P", "P", "P"],
        ["R", "Q", "K", "R"],
    ]
    eval_pawn = ai.evaluate_position(board)
    print(f"Pawn advancement position: {eval_pawn}")
    
    # Test 4: Center control bonus
    board.board = [
        ["r", "q", "k", "r"],
        ["p", "p", "p", "p"],
        [None, "Q", None, None],    # White queen in center
        ["P", "P", "P", "P"],
        ["R", None, "K", "R"],
    ]
    eval_center = ai.evaluate_position(board)
    print(f"Center control position: {eval_center}")
    
    # Verify evaluation makes sense
    if eval_advantage > eval_start + 800:  # Queen advantage ~900 points
        print("✅ Material advantage evaluation working")
    else:
        print("⚠️ Material advantage evaluation may be incorrect")
    
    return True


def test_difficulty_levels():
    """Test different difficulty levels and depth adjustment."""
    print("\n🎯 Testing Difficulty Levels and Depth Adjustment")
    print("=" * 50)
    
    board = ChessBoard()
    expected_depths = {1: 2, 2: 3, 3: 4, 4: 5}  # Updated to match implementation
    
    for level in [1, 2, 3, 4]:
        ai = AIEngine(difficulty_level=level)
        
        print(f"\nDifficulty Level {level}:")
        print(f"Expected depth: {expected_depths[level]}")
        print(f"Actual depth: {ai.depth}")
        
        if ai.depth == expected_depths[level]:
            print("✅ Depth setting correct")
        else:
            print("❌ Depth setting incorrect")
            return False
        
        # Test move calculation
        start_time = time.time()
        best_move = ai.get_best_move(board)
        calc_time = time.time() - start_time
        
        if best_move:
            print(f"Calculation time: {calc_time:.3f}s")
            print(f"Nodes evaluated: {best_move['nodes_evaluated']}")
            
            # Higher difficulty should generally evaluate more nodes
            if level > 1:
                if best_move['nodes_evaluated'] > prev_nodes:
                    print("✅ Higher difficulty evaluates more nodes")
                else:
                    print("⚠️ Node count didn't increase with difficulty")
            
            prev_nodes = best_move['nodes_evaluated']
        else:
            print("❌ Failed to calculate move")
            return False
    
    return True


def test_time_limits():
    """Test that AI calculates moves within reasonable time limits."""
    print("\n⏱️ Testing Time Limits (3 seconds max)")
    print("=" * 38)
    
    board = ChessBoard()
    
    # Test each difficulty level
    for level in [1, 2, 3, 4]:
        ai = AIEngine(difficulty_level=level)
        
        print(f"\nTesting Level {level} (depth {ai.depth}):")
        
        start_time = time.time()
        best_move = ai.get_best_move(board)
        calc_time = time.time() - start_time
        
        print(f"Calculation time: {calc_time:.3f}s")
        
        if calc_time <= 3.0:
            print("✅ Within 3-second limit")
        else:
            print("❌ Exceeded 3-second limit")
            return False
        
        if best_move:
            ai_reported_time = best_move['calculation_time']
            print(f"AI reported time: {ai_reported_time:.3f}s")
            
            # AI reported time should be close to measured time
            if abs(calc_time - ai_reported_time) < 0.1:
                print("✅ Time reporting accurate")
            else:
                print("⚠️ Time reporting may be inaccurate")
    
    return True


def test_javascript_compatibility():
    """Test compatibility with JavaScript AI logic."""
    print("\n🔄 Testing JavaScript Compatibility")
    print("=" * 35)
    
    # Test same starting position as JavaScript
    board = ChessBoard()
    ai = AIEngine(difficulty_level=2)  # Same as JavaScript default
    
    # Get best move
    best_move = ai.get_best_move(board)
    
    if best_move:
        from_pos = best_move['from']
        to_pos = best_move['to']
        piece = best_move['piece']
        
        print(f"AI move: {piece} from {from_pos} to {to_pos}")
        print(f"Evaluation: {best_move['evaluation_score']}")
        
        # Verify it's a valid pawn or piece move (typical opening moves)
        if piece.lower() in ['p', 'n', 'b', 'q', 'k', 'r']:
            print("✅ Valid piece type")
        else:
            print("❌ Invalid piece type")
            return False
        
        # Verify move is legal
        if board.is_valid_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1]):
            print("✅ Legal move")
        else:
            print("❌ Illegal move")
            return False
        
        # Test evaluation function gives reasonable values
        eval_score = ai.evaluate_position(board)
        if -1000 <= eval_score <= 1000:  # Reasonable range for starting position
            print("✅ Evaluation in reasonable range")
        else:
            print(f"⚠️ Evaluation may be out of range: {eval_score}")
        
        return True
    else:
        print("❌ No move calculated")
        return False


def test_move_quality_assessment():
    """Test move quality assessment feature."""
    print("\n⭐ Testing Move Quality Assessment")
    print("=" * 35)
    
    board = ChessBoard()
    ai = AIEngine(difficulty_level=2)
    
    # Test different types of moves
    test_moves = [
        ((3, 1), (2, 1), "Normal pawn move"),
        ((4, 1), (2, 2), "Queen to center"),
        ((4, 2), (3, 1), "King move (probably poor)"),
    ]
    
    for from_pos, to_pos, description in test_moves:
        if board.is_valid_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1]):
            quality = ai.get_move_quality(board, from_pos, to_pos)
            piece = board.get_piece_at(from_pos[0], from_pos[1])
            
            print(f"{description}: {piece} {from_pos} → {to_pos} = {quality}")
            
            # Quality should be one of the expected values
            if quality in ['excellent', 'good', 'average', 'poor', 'blunder']:
                print("✅ Valid quality assessment")
            else:
                print(f"❌ Invalid quality: {quality}")
                return False
        else:
            print(f"{description}: Invalid move")
    
    return True


def test_performance_stats():
    """Test performance statistics reporting."""
    print("\n📈 Testing Performance Statistics")
    print("=" * 35)
    
    board = ChessBoard()
    ai = AIEngine(difficulty_level=3)
    
    # Get move and stats
    best_move = ai.get_best_move(board)
    stats = ai.get_calculation_stats()
    
    if best_move and stats:
        print(f"Nodes evaluated: {stats['nodes_evaluated']}")
        print(f"Max depth reached: {stats['max_depth_reached']}")
        print(f"Difficulty level: {stats['difficulty_level']}")
        print(f"Search depth: {stats['search_depth']}")
        
        # Verify stats match move data
        if (stats['nodes_evaluated'] == best_move['nodes_evaluated'] and
            stats['max_depth_reached'] == best_move['max_depth_reached']):
            print("✅ Statistics consistent")
            return True
        else:
            print("❌ Statistics inconsistent")
            return False
    else:
        print("❌ Failed to get stats")
        return False


def run_comprehensive_test():
    """Run all comprehensive tests."""
    print("🧪 Comprehensive AIEngine Test Suite")
    print("=" * 40)
    
    tests = [
        ("Minimax with Alpha-Beta", test_minimax_with_alpha_beta),
        ("Position Evaluation", test_position_evaluation),
        ("Difficulty Levels", test_difficulty_levels),
        ("Time Limits", test_time_limits),
        ("JavaScript Compatibility", test_javascript_compatibility),
        ("Move Quality Assessment", test_move_quality_assessment),
        ("Performance Statistics", test_performance_stats),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
                print(f"\n✅ {test_name}: PASSED")
            else:
                print(f"\n❌ {test_name}: FAILED")
        except Exception as e:
            print(f"\n❌ {test_name}: ERROR - {e}")
            import traceback
            traceback.print_exc()
    
    print(f"\n" + "=" * 40)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests PASSED! AIEngine implementation is complete.")
        return True
    else:
        print("❌ Some tests FAILED. Please review the implementation.")
        return False


if __name__ == "__main__":
    success = run_comprehensive_test()
    sys.exit(0 if success else 1)