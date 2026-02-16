#!/usr/bin/env python3
"""
Standalone test for AIEngine implementation.

This script tests the AIEngine functionality without importing the Flask app.
"""

import sys
import os
import time

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import chess modules directly
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


def test_ai_basic():
    """Test basic AI functionality."""
    print("🤖 Testing AIEngine Basic Functionality")
    print("=" * 40)
    
    # Create a new chess board
    board = ChessBoard()
    print("Starting position:")
    print_board(board)
    
    # Create AI engine
    ai = AIEngine(difficulty_level=2)
    print(f"AI difficulty level: {ai.difficulty_level}")
    print(f"Search depth: {ai.depth}")
    
    # Get AI move
    print("\nCalculating best move...")
    start_time = time.time()
    best_move = ai.get_best_move(board)
    calculation_time = time.time() - start_time
    
    if best_move:
        from_pos = best_move['from']
        to_pos = best_move['to']
        piece = best_move['piece']
        
        print(f"✅ Best move found: {piece} from {from_pos} to {to_pos}")
        print(f"Total calculation time: {calculation_time:.3f}s")
        print(f"AI reported time: {best_move['calculation_time']:.3f}s")
        print(f"Evaluation score: {best_move['evaluation_score']}")
        print(f"Nodes evaluated: {best_move['nodes_evaluated']}")
        print(f"Max depth reached: {best_move['max_depth_reached']}")
        
        # Test if move is within time limit
        if calculation_time <= 3.0:
            print("✅ Within 3-second time limit")
        else:
            print("⚠️ Exceeded 3-second time limit")
            
        return True
    else:
        print("❌ No valid moves found!")
        return False


def test_ai_difficulty_levels():
    """Test different AI difficulty levels."""
    print("\n🎯 Testing Different Difficulty Levels")
    print("=" * 40)
    
    board = ChessBoard()
    
    for difficulty in [1, 2, 3, 4]:
        print(f"\nDifficulty Level {difficulty}:")
        print("-" * 20)
        
        ai = AIEngine(difficulty_level=difficulty)
        print(f"Search depth: {ai.depth}")
        
        start_time = time.time()
        best_move = ai.get_best_move(board)
        calculation_time = time.time() - start_time
        
        if best_move:
            print(f"Move: {best_move['piece']} {best_move['from']} → {best_move['to']}")
            print(f"Time: {calculation_time:.3f}s")
            print(f"Nodes: {best_move['nodes_evaluated']}")
            print(f"Score: {best_move['evaluation_score']}")
        else:
            print("❌ No move found")


def test_position_evaluation():
    """Test position evaluation function."""
    print("\n📊 Testing Position Evaluation")
    print("=" * 30)
    
    ai = AIEngine(difficulty_level=2)
    
    # Test starting position
    board = ChessBoard()
    evaluation = ai.evaluate_position(board)
    print(f"Starting position evaluation: {evaluation}")
    
    # Test position with advantage
    board.board = [
        ["r", None, "k", "r"],      # Black missing queen
        ["p", "p", "p", "p"],
        [None, None, None, None],
        ["P", "P", "P", "P"],
        ["R", "Q", "K", "R"],       # White has queen
    ]
    
    evaluation = ai.evaluate_position(board)
    print(f"White advantage position: {evaluation}")
    print(f"White winning: {ai.is_position_winning(board, True)}")
    print(f"Black winning: {ai.is_position_winning(board, False)}")


def test_move_quality():
    """Test move quality assessment."""
    print("\n⭐ Testing Move Quality Assessment")
    print("=" * 35)
    
    board = ChessBoard()
    ai = AIEngine(difficulty_level=2)
    
    # Test a few different moves
    test_moves = [
        ((3, 0), (2, 0)),  # Pawn forward
        ((3, 1), (2, 1)),  # Another pawn forward
        ((4, 1), (2, 2)),  # Queen to center (probably good)
    ]
    
    for from_pos, to_pos in test_moves:
        if board.is_valid_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1]):
            quality = ai.get_move_quality(board, from_pos, to_pos)
            piece = board.get_piece_at(from_pos[0], from_pos[1])
            print(f"Move {piece} {from_pos} → {to_pos}: {quality}")
        else:
            print(f"Move {from_pos} → {to_pos}: invalid")


def test_ai_vs_ai():
    """Test AI vs AI game."""
    print("\n🎮 Testing AI vs AI Game")
    print("=" * 25)
    
    board = ChessBoard()
    white_ai = AIEngine(difficulty_level=2)
    black_ai = AIEngine(difficulty_level=2)
    
    move_count = 0
    max_moves = 4  # Play first 2 moves for each side
    
    print("Starting position:")
    print_board(board)
    
    while not board.is_game_over() and move_count < max_moves:
        current_ai = white_ai if board.white_to_move else black_ai
        player = "White" if board.white_to_move else "Black"
        
        print(f"{player}'s turn:")
        best_move = current_ai.get_best_move(board)
        
        if best_move:
            from_pos = best_move['from']
            to_pos = best_move['to']
            piece = best_move['piece']
            
            print(f"{player}: {piece} {from_pos} → {to_pos} (score: {best_move['evaluation_score']})")
            
            # Make the move
            board.make_move(from_pos[0], from_pos[1], to_pos[0], to_pos[1])
            print_board(board)
            
            move_count += 1
        else:
            print(f"{player} has no valid moves!")
            break
    
    print(f"Game status: {board.get_game_result().value}")
    print(f"Total moves: {board.move_count}")


if __name__ == "__main__":
    try:
        success = test_ai_basic()
        if success:
            test_ai_difficulty_levels()
            test_position_evaluation()
            test_move_quality()
            test_ai_vs_ai()
            
            print(f"\n🎉 All AIEngine tests completed successfully!")
        else:
            print(f"\n❌ Basic AI test failed!")
            sys.exit(1)
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)