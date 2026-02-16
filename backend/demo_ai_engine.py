#!/usr/bin/env python3
"""
Demo script for AIEngine implementation.

This script demonstrates the AIEngine functionality by setting up a chess game
and having the AI calculate moves at different difficulty levels.
"""

import sys
import os
import time

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import directly from the chess module
from app.chess.board import ChessBoard
from app.chess.ai_engine import AIEngine


def print_board(board: ChessBoard):
    """Print the chess board in a readable format."""
    print("\n  a b c d")
    for i, row in enumerate(board.board):
        line = f"{5-i} "
        for piece in row:
            line += (piece if piece else '.') + ' '
        print(line)
    print()


def demo_ai_engine():
    """Demonstrate AIEngine functionality."""
    print("🤖 AIEngine Demo - 4x5 Chess AI")
    print("=" * 40)
    
    # Create a new chess board
    board = ChessBoard()
    print("Starting position:")
    print_board(board)
    
    # Test different difficulty levels
    for difficulty in [1, 2, 3, 4]:
        print(f"\n🎯 Testing AI Difficulty Level {difficulty}")
        print("-" * 30)
        
        # Create AI engine
        ai = AIEngine(difficulty_level=difficulty)
        
        # Get AI move
        start_time = time.time()
        best_move = ai.get_best_move(board)
        calculation_time = time.time() - start_time
        
        if best_move:
            from_pos = best_move['from']
            to_pos = best_move['to']
            piece = best_move['piece']
            
            print(f"Best move: {piece} from {from_pos} to {to_pos}")
            print(f"Calculation time: {calculation_time:.3f}s")
            print(f"AI calculation time: {best_move['calculation_time']:.3f}s")
            print(f"Evaluation score: {best_move['evaluation_score']}")
            print(f"Nodes evaluated: {best_move['nodes_evaluated']}")
            print(f"Max depth reached: {best_move['max_depth_reached']}")
            
            # Test move quality assessment
            move_quality = ai.get_move_quality(board, from_pos, to_pos)
            print(f"Move quality: {move_quality}")
        else:
            print("No valid moves found!")
    
    # Test position evaluation
    print(f"\n📊 Position Evaluation")
    print("-" * 20)
    ai = AIEngine(difficulty_level=2)
    evaluation = ai.evaluate_position(board)
    print(f"Starting position evaluation: {evaluation}")
    print(f"White winning: {ai.is_position_winning(board, True)}")
    print(f"Black winning: {ai.is_position_winning(board, False)}")
    
    # Play a few moves to test AI in action
    print(f"\n🎮 AI vs AI Game Sample")
    print("-" * 25)
    
    white_ai = AIEngine(difficulty_level=2)
    black_ai = AIEngine(difficulty_level=2)
    
    move_count = 0
    max_moves = 6  # Play first 3 moves for each side
    
    while not board.is_game_over() and move_count < max_moves:
        current_ai = white_ai if board.white_to_move else black_ai
        player = "White" if board.white_to_move else "Black"
        
        print(f"\n{player}'s turn:")
        best_move = current_ai.get_best_move(board)
        
        if best_move:
            from_pos = best_move['from']
            to_pos = best_move['to']
            piece = best_move['piece']
            
            print(f"{player} plays: {piece} from {from_pos} to {to_pos}")
            print(f"Calculation time: {best_move['calculation_time']:.3f}s")
            
            # Make the move
            board.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])
            print_board(board)
            
            move_count += 1
        else:
            print(f"{player} has no valid moves!")
            break
    
    print(f"\n✅ Demo completed successfully!")
    print(f"Game status: {board.get_game_result().value}")
    print(f"Total moves played: {board.move_count}")


def test_ai_performance():
    """Test AI performance with different positions."""
    print(f"\n⚡ AI Performance Test")
    print("-" * 20)
    
    # Test with starting position
    board = ChessBoard()
    ai = AIEngine(difficulty_level=3)
    
    print("Testing performance on starting position...")
    start_time = time.time()
    best_move = ai.get_best_move(board)
    total_time = time.time() - start_time
    
    if best_move:
        print(f"✅ Move calculated in {total_time:.3f}s")
        print(f"Nodes evaluated: {best_move['nodes_evaluated']}")
        print(f"Search depth: {ai.depth}")
        print(f"Max depth reached: {best_move['max_depth_reached']}")
        
        # Check if within time limit
        if total_time <= 3.0:
            print("✅ Within 3-second time limit")
        else:
            print("⚠️ Exceeded 3-second time limit")
    else:
        print("❌ Failed to calculate move")


def test_edge_cases():
    """Test AI with edge cases."""
    print(f"\n🧪 Edge Case Testing")
    print("-" * 18)
    
    # Test with minimal pieces
    print("Testing with minimal pieces...")
    board = ChessBoard()
    
    # Clear most pieces, leave only kings and a few pieces
    board.board = [
        [None, None, "k", None],      # Black king
        [None, None, None, None],
        [None, None, None, None],
        [None, None, None, None],
        [None, None, "K", None],      # White king
    ]
    
    print_board(board)
    
    ai = AIEngine(difficulty_level=2)
    best_move = ai.get_best_move(board)
    
    if best_move:
        print(f"✅ AI found move: {best_move['piece']} from {best_move['from']} to {best_move['to']}")
    else:
        print("ℹ️ No moves available (expected for king-only position)")
    
    # Test evaluation
    evaluation = ai.evaluate_position(board)
    print(f"Position evaluation: {evaluation}")


if __name__ == "__main__":
    try:
        demo_ai_engine()
        test_ai_performance()
        test_edge_cases()
        
        print(f"\n🎉 All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during demo: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)