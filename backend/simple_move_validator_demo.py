#!/usr/bin/env python3
"""
Simple demonstration script for MoveValidator class.

This script shows how the MoveValidator can be used independently
of the ChessBoard class to validate moves and get detailed error information.
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import directly from the module file
from app.chess.move_validator import MoveValidator


def print_board(board):
    """Print a visual representation of the board."""
    print("\n  a b c d")
    for i, row in enumerate(board):
        rank = 5 - i
        line = f"{rank} "
        for piece in row:
            line += (piece if piece else '.') + ' '
        print(line)
    print()


def main():
    """Main demonstration function."""
    print("MoveValidator Independent Usage Demonstration")
    print("=" * 50)
    
    validator = MoveValidator()
    
    # Create a simple starting position
    board = [
        ["r", "q", "k", "r"],  # Black back rank
        ["p", "p", "p", "p"],  # Black pawns
        [None, None, None, None],  # Empty
        ["P", "P", "P", "P"],  # White pawns
        ["R", "Q", "K", "R"],  # White back rank
    ]
    
    print("Starting position:")
    print_board(board)
    
    print("=== Testing Valid Moves ===")
    
    # Test valid white pawn move
    result = validator.validate_move(board, 3, 0, 2, 0, white_to_move=True)
    print(f"White pawn a2-a3: {'✓ Valid' if result.is_valid else '✗ Invalid'}")
    
    # Test valid black pawn move
    result = validator.validate_move(board, 1, 0, 2, 0, white_to_move=False)
    print(f"Black pawn a4-a3: {'✓ Valid' if result.is_valid else '✗ Invalid'}")
    
    print("\n=== Testing Invalid Moves ===")
    
    # Test wrong turn
    result = validator.validate_move(board, 0, 0, 1, 0, white_to_move=True)
    print(f"Black rook a5-a4 on white's turn: {'✓ Valid' if result.is_valid else '✗ Invalid'}")
    if not result.is_valid:
        print(f"  Error: {result.error_message}")
        print(f"  Details: {result.details}")
    
    # Test invalid coordinates
    result = validator.validate_move(board, -1, 0, 2, 0, white_to_move=True)
    print(f"Invalid coordinates (-1,0) to (2,0): {'✓ Valid' if result.is_valid else '✗ Invalid'}")
    if not result.is_valid:
        print(f"  Error: {result.error_message}")
    
    print("\n=== Testing Piece Move Generation ===")
    
    # Create a position with a rook
    test_board = [
        [None, None, None, None],
        [None, None, None, None],
        [None, "R", None, None],  # White rook at b3
        [None, None, None, None],
        [None, None, None, None],
    ]
    
    print("Position with white rook at b3:")
    print_board(test_board)
    
    # Get all possible rook moves
    rook_moves = validator.get_piece_moves(test_board, 'R', 2, 1)
    print(f"White rook can move to {len(rook_moves)} squares:")
    
    files = ['a', 'b', 'c', 'd']
    ranks = ['5', '4', '3', '2', '1']
    
    for row, col in sorted(rook_moves):
        square = files[col] + ranks[row]
        print(f"  {square}")
    
    print("\n=== Detailed Error Information ===")
    
    # Test detailed error reporting
    result = validator.validate_move(board, 4, 0, 3, 1, white_to_move=True)
    print(f"White rook a1-b2 (invalid diagonal move):")
    print(f"  Valid: {result.is_valid}")
    if not result.is_valid:
        print(f"  Error Code: {result.error_code}")
        print(f"  Message: {result.error_message}")
        print(f"  Details: {result.details}")
    
    print("\n" + "=" * 50)
    print("Demo completed successfully!")
    print("The MoveValidator works independently of ChessBoard class")
    print("and provides detailed validation with structured error messages.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error running demo: {e}")
        import traceback
        traceback.print_exc()