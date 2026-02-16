"""
AIEngine implementation for 4x5 chess game.

This module contains the AIEngine class that implements minimax algorithm with
alpha-beta pruning for move calculation. It ports the JavaScript AI logic to Python
while improving it with proper structure and performance optimizations.
"""

import time
import random
from typing import List, Optional, Tuple, Dict, Any

# Handle both relative and absolute imports
try:
    from .board import ChessBoard
    from .move_validator import MoveValidator
except ImportError:
    from board import ChessBoard
    from move_validator import MoveValidator


class AIEngine:
    """
    AI Engine for 4x5 chess game using minimax algorithm with alpha-beta pruning.
    
    This class provides AI move calculation with different difficulty levels,
    position evaluation, and performance monitoring. It ports the existing
    JavaScript AI logic to Python while maintaining compatibility.
    """
    
    # Piece values for evaluation (same as JavaScript)
    PIECE_VALUES = {
        'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000
    }
    
    # Difficulty level to search depth mapping (adjusted for time constraints)
    AI_DEPTHS = {1: 2, 2: 3, 3: 4, 4: 5}  # Reduced max depth to stay within time limits
    
    # Maximum calculation time in seconds
    MAX_CALCULATION_TIME = 3.0
    
    def __init__(self, difficulty_level: int = 2):
        """
        Initialize the AI engine.
        
        Args:
            difficulty_level: AI difficulty level (1-4)
        """
        self.difficulty_level = max(1, min(4, difficulty_level))
        self.depth = self.AI_DEPTHS[self.difficulty_level]
        self.move_validator = MoveValidator()
        self.calculation_start_time = 0
        self.nodes_evaluated = 0
        self.max_depth_reached = 0
        
    def set_difficulty(self, level: int):
        """
        Set the AI difficulty level.
        
        Args:
            level: Difficulty level (1-4)
        """
        self.difficulty_level = max(1, min(4, level))
        self.depth = self.AI_DEPTHS[self.difficulty_level]
    
    def get_best_move(self, board: ChessBoard) -> Optional[Dict[str, Any]]:
        """
        Calculate the best move for the current position.
        
        Args:
            board: Current chess board state
            
        Returns:
            Dictionary with move information or None if no moves available
        """
        self.calculation_start_time = time.time()
        self.nodes_evaluated = 0
        self.max_depth_reached = 0
        
        # Get all valid moves for the current player
        valid_moves = board.get_all_valid_moves(board.white_to_move)
        
        if not valid_moves:
            return None
        
        # Use minimax with alpha-beta pruning to find the best move
        best_move = self._minimax_root(board, self.depth)
        
        calculation_time = time.time() - self.calculation_start_time
        
        if best_move:
            # Calculate evaluation score for the best move
            test_board = board.copy()
            from_row, from_col = best_move['from']
            to_row, to_col = best_move['to']
            test_board.make_move(from_row, from_col, to_row, to_col)
            evaluation_score = self.evaluate_position(test_board)
            
            return {
                'from': best_move['from'],
                'to': best_move['to'],
                'piece': best_move['piece'],
                'calculation_time': calculation_time,
                'evaluation_score': evaluation_score,
                'nodes_evaluated': self.nodes_evaluated,
                'max_depth_reached': self.max_depth_reached,
                'difficulty_level': self.difficulty_level
            }
        
        return None
    
    def _minimax_root(self, board: ChessBoard, depth: int) -> Optional[Dict[str, Any]]:
        """
        Root minimax function that finds the best move.
        
        Args:
            board: Current chess board state
            depth: Search depth
            
        Returns:
            Best move dictionary or None
        """
        valid_moves = board.get_all_valid_moves(board.white_to_move)
        
        if not valid_moves:
            return None
        
        best_score = float('-inf') if board.white_to_move else float('inf')
        best_moves = []
        
        for move in valid_moves:
            # Check time limit
            if time.time() - self.calculation_start_time > self.MAX_CALCULATION_TIME:
                break
            
            # Make the move on a copy of the board
            test_board = board.copy()
            from_row, from_col = move['from']
            to_row, to_col = move['to']
            
            # Apply the move
            captured_piece = test_board.get_piece_at(to_row, to_col)
            test_board.make_move(from_row, from_col, to_row, to_col)
            
            # Handle pawn promotion (same logic as JavaScript)
            piece = move['piece']
            if piece.lower() == 'p':
                promotion_row = 0 if board.white_to_move else 4
                if to_row == promotion_row:
                    promoted_piece = 'Q' if board.white_to_move else 'q'
                    test_board.set_piece_at(to_row, to_col, promoted_piece)
            
            # Calculate score using minimax
            score = self._minimax(test_board, depth - 1, float('-inf'), float('inf'), not board.white_to_move)
            
            # Update best moves
            if board.white_to_move:  # Maximizing player
                if score > best_score:
                    best_score = score
                    best_moves = [move]
                elif score == best_score:
                    best_moves.append(move)
            else:  # Minimizing player
                if score < best_score:
                    best_score = score
                    best_moves = [move]
                elif score == best_score:
                    best_moves.append(move)
        
        # Return a random move from the best moves (same as JavaScript)
        if best_moves:
            return random.choice(best_moves)
        
        return None
    
    def _minimax(self, board: ChessBoard, depth: int, alpha: float, beta: float, maximizing: bool) -> float:
        """
        Minimax algorithm with alpha-beta pruning.
        
        Args:
            board: Current board state
            depth: Remaining search depth
            alpha: Alpha value for pruning
            beta: Beta value for pruning
            maximizing: True if maximizing player, False if minimizing
            
        Returns:
            Evaluation score
        """
        self.nodes_evaluated += 1
        self.max_depth_reached = max(self.max_depth_reached, self.depth - depth)
        
        # Check time limit more frequently
        if self.nodes_evaluated % 100 == 0:  # Check every 100 nodes
            if time.time() - self.calculation_start_time > self.MAX_CALCULATION_TIME * 0.9:  # 90% of time limit
                return self.evaluate_position(board)
        
        # Base case: reached maximum depth
        if depth == 0:
            return self.evaluate_position(board)
        
        # Get all valid moves for current player
        valid_moves = board.get_all_valid_moves(maximizing)
        
        # No valid moves - game over
        if not valid_moves:
            return 9999 if not maximizing else -9999
        
        if maximizing:
            max_score = float('-inf')
            for move in valid_moves:
                # Check time limit before each move
                if time.time() - self.calculation_start_time > self.MAX_CALCULATION_TIME * 0.9:
                    break
                
                # Make move on copy
                test_board = board.copy()
                from_row, from_col = move['from']
                to_row, to_col = move['to']
                
                # Apply move with pawn promotion handling
                piece = move['piece']
                test_board.make_move(from_row, from_col, to_row, to_col)
                
                if piece.lower() == 'p':
                    promotion_row = 0 if maximizing else 4
                    if to_row == promotion_row:
                        promoted_piece = 'Q' if maximizing else 'q'
                        test_board.set_piece_at(to_row, to_col, promoted_piece)
                
                # Recursive call
                score = self._minimax(test_board, depth - 1, alpha, beta, False)
                max_score = max(max_score, score)
                alpha = max(alpha, score)
                
                # Alpha-beta pruning
                if beta <= alpha:
                    break
            
            return max_score
        else:
            min_score = float('inf')
            for move in valid_moves:
                # Check time limit before each move
                if time.time() - self.calculation_start_time > self.MAX_CALCULATION_TIME * 0.9:
                    break
                
                # Make move on copy
                test_board = board.copy()
                from_row, from_col = move['from']
                to_row, to_col = move['to']
                
                # Apply move with pawn promotion handling
                piece = move['piece']
                test_board.make_move(from_row, from_col, to_row, to_col)
                
                if piece.lower() == 'p':
                    promotion_row = 0 if not maximizing else 4
                    if to_row == promotion_row:
                        promoted_piece = 'Q' if not maximizing else 'q'
                        test_board.set_piece_at(to_row, to_col, promoted_piece)
                
                # Recursive call
                score = self._minimax(test_board, depth - 1, alpha, beta, True)
                min_score = min(min_score, score)
                beta = min(beta, score)
                
                # Alpha-beta pruning
                if beta <= alpha:
                    break
            
            return min_score
    
    def evaluate_position(self, board: ChessBoard) -> float:
        """
        Evaluate the current board position.
        
        This function ports the JavaScript evaluation logic with the same
        bonuses and penalties for piece positioning.
        
        Args:
            board: Chess board to evaluate
            
        Returns:
            Evaluation score (positive favors white, negative favors black)
        """
        score = 0
        
        for row in range(5):
            for col in range(4):
                piece = board.get_piece_at(row, col)
                if piece:
                    piece_value = self.PIECE_VALUES[piece.lower()]
                    is_white = board.is_white_piece(piece)
                    
                    # Pawn advancement bonus (same as JavaScript)
                    if piece.lower() == 'p':
                        if is_white:
                            piece_value += (3 - row) * 10  # White pawns advance up (decreasing row)
                        else:
                            piece_value += row * 10  # Black pawns advance down (increasing row)
                    
                    # Center control bonus (same as JavaScript)
                    if col == 1 or col == 2:
                        piece_value += 5
                    
                    # King safety bonus (same as JavaScript)
                    if piece.lower() == 'k':
                        # Corner positions are safer
                        if (row == 0 or row == 4) and (col == 0 or col == 3):
                            piece_value += 10
                        # Edge positions are also safe
                        if row == 0 or row == 4 or col == 0 or col == 3:
                            piece_value += 5
                    
                    # Queen activity bonus (same as JavaScript)
                    if piece.lower() == 'q':
                        # Central control is valuable for queen
                        if 1 <= row <= 3 and 1 <= col <= 2:
                            piece_value += 20
                    
                    # Rook activity bonus (same as JavaScript)
                    if piece.lower() == 'r':
                        # Open files are valuable for rooks
                        column_open = True
                        for check_row in range(5):
                            if (check_row != row and 
                                board.get_piece_at(check_row, col) and
                                board.get_piece_at(check_row, col).lower() == 'p'):
                                column_open = False
                                break
                        if column_open:
                            piece_value += 15
                    
                    # Add to score (positive for white, negative for black)
                    score += piece_value if is_white else -piece_value
        
        return score
    
    def get_calculation_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the last calculation.
        
        Returns:
            Dictionary with calculation statistics
        """
        return {
            'nodes_evaluated': self.nodes_evaluated,
            'max_depth_reached': self.max_depth_reached,
            'difficulty_level': self.difficulty_level,
            'search_depth': self.depth
        }
    
    def is_position_winning(self, board: ChessBoard, for_white: bool) -> bool:
        """
        Check if a position is winning for the specified player.
        
        Args:
            board: Chess board to evaluate
            for_white: True to check if white is winning, False for black
            
        Returns:
            True if the position is winning for the specified player
        """
        evaluation = self.evaluate_position(board)
        
        # A position is considered winning if the evaluation is strongly in favor
        winning_threshold = 500  # Roughly equivalent to a rook advantage
        
        if for_white:
            return evaluation > winning_threshold
        else:
            return evaluation < -winning_threshold
    
    def get_move_quality(self, board: ChessBoard, from_pos: Tuple[int, int], to_pos: Tuple[int, int]) -> str:
        """
        Evaluate the quality of a specific move.
        
        Args:
            board: Current board state
            from_pos: Starting position (row, col)
            to_pos: Ending position (row, col)
            
        Returns:
            Move quality string ('excellent', 'good', 'average', 'poor', 'blunder')
        """
        # Make the move on a copy
        test_board = board.copy()
        from_row, from_col = from_pos
        to_row, to_col = to_pos
        
        # Get evaluation before move
        eval_before = self.evaluate_position(board)
        
        # Make the move
        if test_board.make_move(from_row, from_col, to_row, to_col):
            eval_after = self.evaluate_position(test_board)
            
            # Calculate improvement (from current player's perspective)
            if board.white_to_move:
                improvement = eval_after - eval_before
            else:
                improvement = eval_before - eval_after
            
            # Classify move quality
            if improvement >= 300:
                return 'excellent'
            elif improvement >= 100:
                return 'good'
            elif improvement >= -50:
                return 'average'
            elif improvement >= -200:
                return 'poor'
            else:
                return 'blunder'
        
        return 'invalid'