#!/usr/bin/env python3
"""
Demo script showing ChessBoard functionality.

This script demonstrates the basic functionality of the ChessBoard class
including move validation, game state management, and serialization.
"""

# Direct import to avoid Flask app initialization
from chess.board import ChessBoard, GameResult

def main():
    print("=== 4x5 Chess Board Demo ===\n")
    
    # Create a new chess board
    board = ChessBoard()
    print("Initial board position:")
    print(board)
    print()
    
    # Show game state
    print(f"White to move: {board.white_to_move}")
    print(f"Move count: {board.move_count}")
    print(f"Game result: {board.get_game_result()}")
    print()
    
    # Make some moves
    print("Making moves:")
    
    # White pawn move
    success = board.make_move(3, 0, 2, 0)  # a2-a3
    print(f"1. White pawn a2-a3: {'Success' if success else 'Failed'}")
    
    # Black pawn move
    success = board.make_move(1, 1, 2, 1)  # b4-b3
    print(f"2. Black pawn b4-b3: {'Success' if success else 'Failed'}")
    
    # White knight move
    success = board.make_move(4, 2, 2, 3)  # Invalid knight move
    print(f"3. White king c1-d3 (invalid): {'Success' if success else 'Failed'}")
    
    print("\nBoard after moves:")
    print(board)
    print()
    
    # Show move history
    print("Move history:")
    for i, move in enumerate(board.move_history):
        print(f"{i+1}. {move['piece']} {move['notation']}" + 
              (f" captures {move['captured']}" if move['captured'] else ""))
    print()
    
    # Show captured pieces
    print(f"Captured by white: {board.captured_pieces['white']}")
    print(f"Captured by black: {board.captured_pieces['black']}")
    print()
    
    # Show valid moves for a piece
    valid_moves = board.get_valid_moves(4, 0)  # White rook
    print(f"Valid moves for white rook at a1: {valid_moves}")
    print()
    
    # Demonstrate serialization
    board_dict = board.to_dict()
    print("Board serialized to dictionary (keys):", list(board_dict.keys()))
    
    # Create board from dictionary
    new_board = ChessBoard.from_dict(board_dict)
    print(f"Deserialized board matches original: {new_board.board == board.board}")
    print()
    
    # Demonstrate endgame scenario
    print("=== Endgame Demo ===")
    endgame_position = [
        [None, None, None, None],
        [None, None, None, None],
        [None, None, None, None],
        [None, None, None, "K"],  # White king
        ["k", "R", None, None],   # Black king and white rook
    ]
    
    endgame_board = ChessBoard(position=endgame_position)
    print("Endgame position:")
    print(endgame_board)
    
    # White rook captures black king
    success = endgame_board.make_move(4, 1, 4, 0)
    print(f"\nWhite rook captures black king: {'Success' if success else 'Failed'}")
    print(f"Game over: {endgame_board.is_game_over()}")
    print(f"Winner: {endgame_board.get_game_result()}")
    
    print("\nFinal position:")
    print(endgame_board)

if __name__ == "__main__":
    main()