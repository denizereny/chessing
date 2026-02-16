#!/usr/bin/env python3
"""
Demonstration script for MoveValidator class.

This script shows how the MoveValidator can be used independently
of the ChessBoard class to validate moves and get detailed error information.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

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


def demo_basic_validation():
    """Demonstrate basic move validation."""
    print("=== Basic Move Validation Demo ===")
    
    validator = MoveValidator()
    
    # Create a simple position
    board = [
        ["r", "q", "k", "r"],  # Black back rank
        ["p", "p", "p", "p"],  # Black pawns
        [None, None, None, None],  # Empty
        ["P", "P", "P", "P"],  # White pawns
        ["R", "Q", "K", "R"],  # White back rank
    ]
    
    print("Starting position:")
    print_board(board)
    
    # Test valid moves
    print("Testing valid moves:")
    
    # White pawn forward
    result = validator.validate_move(board, 3, 0, 2, 0, white_to_move=True)
    print(f"White pawn a2-a3: {'✓ Valid' if result.is_valid else '✗ Invalid'}")
    
    # White knight move (if we had one)
    board[4][1] = "N"  # Add a knight
    result = validator.validate_move(board, 4, 1, 2, 0, white_to_move=True)
    print(f"White knight b1-a3: {'✓ Valid' if result.is_valid else '✗ Invalid'}")
    
    print("\nTesting invalid moves:")
    
    # Try to move opponent's piece
    result = validator.validate_move(board, 0, 0, 1, 0, white_to_move=True)
    print(f"Black rook a5-a4 on white's turn: {'✓ Valid' if result.is_valid else '✗ Invalid'}")
    if not result.is_valid:
        print(f"  Error: {result.error_message}")
    
    # Try invalid rook move
    result = validator.validate_move(board, 4, 0, 3, 1, white_to_move=True)
    print(f"White rook a1-b2 (diagonal): {'✓ Valid' if result.is_valid else '✗ Invalid'}")
    if not result.is_valid:
        print(f"  Error: {result.error_message}")


def demo_detailed_errors():
    """Demonstrate detailed error reporting."""
    print("\n=== Detailed Error Reporting Demo ===")
    
    validator = MoveValidator()
    
    board = [
        [None, None, "k", None],
        [None, None, None, None],
        [None, "R", None, None],
        [None, None, None, None],
        [None, "Q", "K", None],
    ]
    
    print("Test position:")
    print_board(board)
    
    # Test various error conditions
    error_tests = [
        ("Invalid coordinates", (-1, 0, 2, 0)),
        ("Same square", (2, 1, 2, 1)),
        ("No piece at source", (1, 0, 2, 0)),
        ("Wrong turn", (0, 2, 1, 2)),  # Black king on white's turn
        ("Invalid rook move", (2, 1, 3, 2)),  # Diagonal move
    ]
    
    for description, (from_row, from_col, to_row, to_col) in error_tests:
        result = validator.validate_move(board, from_row, from_col, to_row, to_col, white_to_move=True)
        print(f"\n{description}:")
        print(f"  Move: ({from_row},{from_col}) -> ({to_row},{to_col})")
        print(f"  Valid: {result.is_valid}")
        if not result.is_valid:
            print(f"  Error Code: {result.error_code}")
            print(f"  Message: {result.error_message}")
            if result.details:
                print(f"  Details: {result.details}")


def demo_piece_moves():
    """Demonstrate getting all possible moves for pieces."""
    print("\n=== Piece Move Generation Demo ===")
    
    validator = MoveValidator()
    
    # Create a position with various pieces
    board = [
        [None, None, None, None],
        [None, None, None, None],
        [None, "R", None, None],  # White rook
        [None, None, None, None],
        [None, None, None, None],
    ]
    
    print("Position with white rook at b3:")
    print_board(board)
    
    # Get all rook moves
    rook_moves = validator.get_piece_moves(board, 'R', 2, 1)
    print(f"White rook can move to {len(rook_moves)} squares:")
    for row, col in sorted(rook_moves):
        files = ['a', 'b', 'c', 'd']
        ranks = ['5', '4', '3', '2', '1']
        square = files[col] + ranks[row]
        print(f"  {square}")
    
    # Add some pieces to block/capture
    board[2][3] = "p"  # Black pawn to capture
    board[4][1] = "P"  # White pawn to block
    
    print("\nAfter adding pieces (black pawn at d3, white pawn at b1):")
    print_board(board)
    
    rook_moves = validator.get_piece_moves(board, 'R', 2, 1)
    print(f"White rook can now move to {len(rook_moves)} squares:")
    for row, col in sorted(rook_moves):
        files = ['a', 'b', 'c', 'd']
        ranks = ['5', '4', '3', '2', '1']
        square = files[col] + ranks[row]
        piece_at_dest = board[row][col]
        action = " (capture)" if piece_at_dest else ""
        print(f"  {square}{action}")


def demo_javascript_consistency():
    """Demonstrate consistency with JavaScript validation logic."""
    print("\n=== JavaScript Consistency Demo ===")
    
    validator = MoveValidator()
    
    # Test pawn moves (matching JavaScript getValidMoves logic)
    board = [
        [None, None, None, None],
        [None, "p", None, None],  # Black pawn
        [None, None, None, None],
        [None, "P", None, None],  # White pawn
        [None, None, None, None],
    ]
    
    print("Pawn test position:")
    print_board(board)
    
    print("Pawn move validation (matching JavaScript logic):")
    
    # White pawn moves
    white_pawn_moves = validator.get_piece_moves(board, 'P', 3, 1)
    print(f"White pawn at b2 can move to: {len(white_pawn_moves)} squares")
    for row, col in white_pawn_moves:
        files = ['a', 'b', 'c', 'd']
        ranks = ['5', '4', '3', '2', '1']
        square = files[col] + ranks[row]
        print(f"  {square}")
    
    # Black pawn moves
    black_pawn_moves = validator.get_piece_moves(board, 'p', 1, 1)
    print(f"Black pawn at b4 can move to: {len(black_pawn_moves)} squares")
    for row, col in black_pawn_moves:
        files = ['a', 'b', 'c', 'd']
        ranks = ['5', '4', '3', '2', '1']
        square = files[col] + ranks[row]
        print(f"  {square}")
    
    # Test pawn captures
    board[2][0] = "p"  # Black pawn for white to capture
    board[2][2] = "P"  # White pawn for black to capture
    
    print("\nAfter adding capture targets:")
    print_board(board)
    
    # Test diagonal captures
    result = validator.validate_move(board, 3, 1, 2, 0, white_to_move=True)
    print(f"White pawn b2xa3: {'✓ Valid' if result.is_valid else '✗ Invalid'}")
    
    result = validator.validate_move(board, 1, 1, 2, 2, white_to_move=False)
    print(f"Black pawn b4xc3: {'✓ Valid' if result.is_valid else '✗ Invalid'}")


if __name__ == "__main__":
    print("MoveValidator Independent Usage Demonstration")
    print("=" * 50)
    
    demo_basic_validation()
    demo_detailed_errors()
    demo_piece_moves()
    demo_javascript_consistency()
    
    print("\n" + "=" * 50)
    print("Demo completed! The MoveValidator can be used independently")
    print("of the ChessBoard class to validate moves and provide detailed")
    print("error information, making it perfect for API endpoints and")
    print("other validation scenarios.")