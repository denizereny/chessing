"""
Property-based tests for MoveValidator class.

This module contains property-based tests that validate universal properties
of the MoveValidator class across all possible inputs and scenarios.

**Feature: flask-chess-backend, Property 1: Hamle Validasyon Tutarlılığı**
**Feature: flask-chess-backend, Property 4: Input Validation ve Hata Mesajları**
**Validates: Requirements 1.1, 1.4, 1.5**
"""

import pytest
from hypothesis import given, strategies as st, assume, settings, example
from typing import List, Optional, Tuple, Dict, Any
from backend.app.chess.move_validator import MoveValidator, ValidationResult, ValidationError


# Test data generators
@st.composite
def valid_board_position(draw):
    """Generate valid board coordinates."""
    row = draw(st.integers(min_value=0, max_value=4))
    col = draw(st.integers(min_value=0, max_value=3))
    return (row, col)


@st.composite
def invalid_board_position(draw):
    """Generate invalid board coordinates."""
    # Generate coordinates that are outside the 5x4 board
    choice = draw(st.integers(min_value=0, max_value=3))
    if choice == 0:
        # Invalid row (negative)
        row = draw(st.integers(max_value=-1))
        col = draw(st.integers(min_value=0, max_value=3))
    elif choice == 1:
        # Invalid row (too large)
        row = draw(st.integers(min_value=5))
        col = draw(st.integers(min_value=0, max_value=3))
    elif choice == 2:
        # Invalid col (negative)
        row = draw(st.integers(min_value=0, max_value=4))
        col = draw(st.integers(max_value=-1))
    else:
        # Invalid col (too large)
        row = draw(st.integers(min_value=0, max_value=4))
        col = draw(st.integers(min_value=4))
    return (row, col)


@st.composite
def chess_piece(draw):
    """Generate a valid chess piece."""
    piece_types = ['p', 'r', 'n', 'b', 'q', 'k']
    piece_type = draw(st.sampled_from(piece_types))
    is_white = draw(st.booleans())
    return piece_type.upper() if is_white else piece_type


@st.composite
def chess_board(draw):
    """Generate a valid 5x4 chess board."""
    board = []
    for row in range(5):
        board_row = []
        for col in range(4):
            # Each square can be empty or contain a piece
            has_piece = draw(st.booleans())
            if has_piece:
                piece = draw(chess_piece())
                board_row.append(piece)
            else:
                board_row.append(None)
        board.append(board_row)
    return board


@st.composite
def board_with_piece_at(draw, piece_type: str, position: Tuple[int, int]):
    """Generate a board with a specific piece at a specific position."""
    board = draw(chess_board())
    row, col = position
    board[row][col] = piece_type
    return board


@st.composite
def move_request(draw):
    """Generate a move request with from and to positions."""
    from_pos = draw(valid_board_position())
    to_pos = draw(valid_board_position())
    return from_pos, to_pos


class TestMoveValidatorProperties:
    """Property-based tests for MoveValidator."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.validator = MoveValidator()
    
    # Property 1: Hamle Validasyon Tutarlılığı
    # **Validates: Requirements 1.1, 1.4**
    
    @given(
        board=chess_board(),
        from_pos=valid_board_position(),
        to_pos=valid_board_position(),
        white_to_move=st.booleans()
    )
    @settings(max_examples=5)
    def test_property_1_move_validation_consistency_with_javascript_logic(
        self, board, from_pos, to_pos, white_to_move
    ):
        """
        **Property 1: Hamle Validasyon Tutarlılığı**
        
        For any hamle isteği, Chess_Engine'in Python'da yaptığı validasyon sonucu,
        mevcut JavaScript validasyon kuralları ile aynı olmalıdır.
        
        This property ensures that the Python MoveValidator produces the same
        validation results as the JavaScript implementation for all possible moves.
        """
        from_row, from_col = from_pos
        to_row, to_col = to_pos
        
        result = self.validator.validate_move(
            board, from_row, from_col, to_row, to_col, white_to_move
        )
        
        # Verify that the validation result follows JavaScript logic patterns
        piece = board[from_row][from_col]
        
        # If moving to same square, should be invalid (checked first in validator)
        if from_row == to_row and from_col == to_col:
            assert not result.is_valid
            assert result.error_code == ValidationError.SAME_SQUARE.value
            return
        
        # If no piece at source, should be invalid
        if piece is None:
            assert not result.is_valid
            assert result.error_code == ValidationError.NO_PIECE_AT_SOURCE.value
            return
        
        # Check turn consistency (JavaScript logic)
        is_white_piece = piece.isupper()
        if (white_to_move and not is_white_piece) or (not white_to_move and is_white_piece):
            assert not result.is_valid
            assert result.error_code == ValidationError.WRONG_TURN.value
            return
        
        # Check own piece capture (JavaScript logic)
        target_piece = board[to_row][to_col]
        if target_piece and (piece.isupper() == target_piece.isupper()):
            assert not result.is_valid
            assert result.error_code == ValidationError.CAPTURE_OWN_PIECE.value
            return
        
        # If we get here, the move passed basic validation
        # The piece-specific validation should follow JavaScript patterns
        self._verify_piece_specific_validation_consistency(
            result, board, piece, from_row, from_col, to_row, to_col
        )
    
    def _verify_piece_specific_validation_consistency(
        self, result: ValidationResult, board: List[List[Optional[str]]],
        piece: str, from_row: int, from_col: int, to_row: int, to_col: int
    ):
        """Verify piece-specific validation follows JavaScript patterns."""
        piece_type = piece.lower()
        is_white = piece.isupper()
        
        if piece_type == 'p':
            self._verify_pawn_validation_consistency(
                result, board, piece, is_white, from_row, from_col, to_row, to_col
            )
        elif piece_type == 'r':
            self._verify_rook_validation_consistency(
                result, board, from_row, from_col, to_row, to_col
            )
        elif piece_type == 'n':
            self._verify_knight_validation_consistency(
                result, from_row, from_col, to_row, to_col
            )
        elif piece_type == 'b':
            self._verify_bishop_validation_consistency(
                result, board, from_row, from_col, to_row, to_col
            )
        elif piece_type == 'q':
            self._verify_queen_validation_consistency(
                result, board, from_row, from_col, to_row, to_col
            )
        elif piece_type == 'k':
            self._verify_king_validation_consistency(
                result, from_row, from_col, to_row, to_col
            )
    
    def _verify_pawn_validation_consistency(
        self, result: ValidationResult, board: List[List[Optional[str]]],
        piece: str, is_white: bool, from_row: int, from_col: int, to_row: int, to_col: int
    ):
        """Verify pawn validation follows JavaScript logic."""
        direction = -1 if is_white else 1
        row_diff = to_row - from_row
        col_diff = abs(to_col - from_col)
        
        # Forward move (JavaScript pattern)
        if col_diff == 0:
            if row_diff == direction:
                # One square forward - should be valid if target is empty
                if board[to_row][to_col] is None:
                    assert result.is_valid
                else:
                    assert not result.is_valid
            elif row_diff == 2 * direction:
                # Two squares forward from starting position
                starting_row = 3 if is_white else 1
                if from_row == starting_row:
                    if (board[to_row][to_col] is None and 
                        board[from_row + direction][from_col] is None):
                        assert result.is_valid
                    else:
                        assert not result.is_valid
                else:
                    assert not result.is_valid
            else:
                assert not result.is_valid
        
        # Diagonal capture (JavaScript pattern)
        elif col_diff == 1 and row_diff == direction:
            target_piece = board[to_row][to_col]
            if (target_piece is not None and 
                (piece.isupper() != target_piece.isupper())):
                assert result.is_valid
            else:
                assert not result.is_valid
        else:
            assert not result.is_valid
    
    def _verify_rook_validation_consistency(
        self, result: ValidationResult, board: List[List[Optional[str]]],
        from_row: int, from_col: int, to_row: int, to_col: int
    ):
        """Verify rook validation follows JavaScript logic."""
        # Must move in straight line
        if from_row != to_row and from_col != to_col:
            assert not result.is_valid
            return
        
        # Check path is clear (JavaScript addLineMoves logic)
        path_clear = self._is_path_clear_javascript_style(
            board, from_row, from_col, to_row, to_col
        )
        if path_clear:
            assert result.is_valid
        else:
            assert not result.is_valid
    
    def _verify_knight_validation_consistency(
        self, result: ValidationResult, from_row: int, from_col: int, to_row: int, to_col: int
    ):
        """Verify knight validation follows JavaScript logic."""
        row_diff = abs(to_row - from_row)
        col_diff = abs(to_col - from_col)
        
        # JavaScript knight moves: [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [1,-2], [-1,2], [-1,-2]]
        if (row_diff == 2 and col_diff == 1) or (row_diff == 1 and col_diff == 2):
            assert result.is_valid
        else:
            assert not result.is_valid
    
    def _verify_bishop_validation_consistency(
        self, result: ValidationResult, board: List[List[Optional[str]]],
        from_row: int, from_col: int, to_row: int, to_col: int
    ):
        """Verify bishop validation follows JavaScript logic."""
        row_diff = abs(to_row - from_row)
        col_diff = abs(to_col - from_col)
        
        # Must move diagonally
        if row_diff != col_diff:
            assert not result.is_valid
            return
        
        # Check path is clear
        path_clear = self._is_path_clear_javascript_style(
            board, from_row, from_col, to_row, to_col
        )
        if path_clear:
            assert result.is_valid
        else:
            assert not result.is_valid
    
    def _verify_queen_validation_consistency(
        self, result: ValidationResult, board: List[List[Optional[str]]],
        from_row: int, from_col: int, to_row: int, to_col: int
    ):
        """Verify queen validation follows JavaScript logic."""
        # Queen moves like rook or bishop
        row_diff = abs(to_row - from_row)
        col_diff = abs(to_col - from_col)
        
        # Rook-like move (straight line)
        if from_row == to_row or from_col == to_col:
            path_clear = self._is_path_clear_javascript_style(
                board, from_row, from_col, to_row, to_col
            )
            if path_clear:
                assert result.is_valid
            else:
                assert not result.is_valid
            return
        
        # Bishop-like move (diagonal)
        if row_diff == col_diff:
            path_clear = self._is_path_clear_javascript_style(
                board, from_row, from_col, to_row, to_col
            )
            if path_clear:
                assert result.is_valid
            else:
                assert not result.is_valid
            return
        
        # Invalid queen move
        assert not result.is_valid
    
    def _verify_king_validation_consistency(
        self, result: ValidationResult, from_row: int, from_col: int, to_row: int, to_col: int
    ):
        """Verify king validation follows JavaScript logic."""
        row_diff = abs(to_row - from_row)
        col_diff = abs(to_col - from_col)
        
        # JavaScript king logic: one square in any direction
        if row_diff <= 1 and col_diff <= 1 and (row_diff + col_diff > 0):
            assert result.is_valid
        else:
            assert not result.is_valid
    
    def _is_path_clear_javascript_style(
        self, board: List[List[Optional[str]]], 
        from_row: int, from_col: int, to_row: int, to_col: int
    ) -> bool:
        """Check if path is clear using JavaScript addLineMoves logic."""
        if from_row == to_row and from_col == to_col:
            return True
        
        # Determine direction
        row_step = 0 if from_row == to_row else (1 if to_row > from_row else -1)
        col_step = 0 if from_col == to_col else (1 if to_col > from_col else -1)
        
        current_row = from_row + row_step
        current_col = from_col + col_step
        
        while current_row != to_row or current_col != to_col:
            if board[current_row][current_col] is not None:
                return False
            current_row += row_step
            current_col += col_step
        
        return True
    
    # Property 4: Input Validation ve Hata Mesajları
    # **Validates: Requirements 1.5**
    
    @given(
        board=chess_board(),
        from_pos=st.one_of(valid_board_position(), invalid_board_position()),
        to_pos=st.one_of(valid_board_position(), invalid_board_position()),
        white_to_move=st.booleans()
    )
    @settings(max_examples=5)
    def test_property_4_input_validation_and_error_messages(
        self, board, from_pos, to_pos, white_to_move
    ):
        """
        **Property 4: Input Validation ve Hata Mesajları**
        
        For any geçersiz input, sistem uygun validasyon hatası ve açıklayıcı mesaj dönmelidir.
        
        This property ensures that all invalid inputs result in appropriate validation
        errors with descriptive messages.
        """
        from_row, from_col = from_pos
        to_row, to_col = to_pos
        
        result = self.validator.validate_move(
            board, from_row, from_col, to_row, to_col, white_to_move
        )
        
        # Check coordinate validation
        if not self._are_coordinates_valid(from_row, from_col, to_row, to_col):
            assert not result.is_valid
            assert result.error_code == ValidationError.INVALID_COORDINATES.value
            assert result.error_message is not None
            assert len(result.error_message) > 0
            assert result.details is not None
            assert 'from' in result.details
            assert 'to' in result.details
            assert 'board_size' in result.details
            return
        
        # If coordinates are valid, continue with other validations
        self._verify_comprehensive_error_handling(
            result, board, from_row, from_col, to_row, to_col, white_to_move
        )
    
    def _are_coordinates_valid(self, from_row: int, from_col: int, to_row: int, to_col: int) -> bool:
        """Check if coordinates are within board bounds."""
        return (0 <= from_row < 5 and 0 <= from_col < 4 and
                0 <= to_row < 5 and 0 <= to_col < 4)
    
    def _verify_comprehensive_error_handling(
        self, result: ValidationResult, board: List[List[Optional[str]]],
        from_row: int, from_col: int, to_row: int, to_col: int, white_to_move: bool
    ):
        """Verify comprehensive error handling for all invalid scenarios."""
        piece = board[from_row][from_col]
        
        # Same square error
        if from_row == to_row and from_col == to_col:
            assert not result.is_valid
            assert result.error_code == ValidationError.SAME_SQUARE.value
            assert result.error_message is not None
            assert 'same square' in result.error_message.lower()
            assert result.details is not None
            assert 'position' in result.details
            return
        
        # No piece at source error
        if piece is None:
            assert not result.is_valid
            assert result.error_code == ValidationError.NO_PIECE_AT_SOURCE.value
            assert result.error_message is not None
            assert 'no piece' in result.error_message.lower()
            assert result.details is not None
            assert 'position' in result.details
            return
        
        # Wrong turn error
        is_white_piece = piece.isupper()
        if (white_to_move and not is_white_piece) or (not white_to_move and is_white_piece):
            assert not result.is_valid
            assert result.error_code == ValidationError.WRONG_TURN.value
            assert result.error_message is not None
            assert 'turn' in result.error_message.lower()
            assert result.details is not None
            assert 'piece' in result.details
            assert 'piece_color' in result.details
            assert 'turn' in result.details
            return
        
        # Capture own piece error
        target_piece = board[to_row][to_col]
        if target_piece and (piece.isupper() == target_piece.isupper()):
            assert not result.is_valid
            assert result.error_code == ValidationError.CAPTURE_OWN_PIECE.value
            assert result.error_message is not None
            assert 'own piece' in result.error_message.lower()
            assert result.details is not None
            assert 'moving_piece' in result.details
            assert 'target_piece' in result.details
            assert 'position' in result.details
            return
        
        # If move is invalid due to piece-specific rules, verify error details
        if not result.is_valid:
            assert result.error_code is not None
            assert result.error_message is not None
            assert len(result.error_message) > 0
            assert result.details is not None
    
    @given(
        invalid_coords=invalid_board_position(),
        valid_coords=valid_board_position(),
        board=chess_board(),
        white_to_move=st.booleans()
    )
    @settings(max_examples=5)
    def test_property_4_invalid_coordinates_always_rejected(
        self, invalid_coords, valid_coords, board, white_to_move
    ):
        """
        **Property 4 Extension: Invalid Coordinates**
        
        Any move with invalid coordinates should always be rejected with
        appropriate error message and details.
        """
        invalid_row, invalid_col = invalid_coords
        valid_row, valid_col = valid_coords
        
        # Test invalid from coordinates
        result = self.validator.validate_move(
            board, invalid_row, invalid_col, valid_row, valid_col, white_to_move
        )
        assert not result.is_valid
        assert result.error_code == ValidationError.INVALID_COORDINATES.value
        assert result.error_message is not None
        assert 'coordinate' in result.error_message.lower()
        assert result.details is not None
        
        # Test invalid to coordinates
        result = self.validator.validate_move(
            board, valid_row, valid_col, invalid_row, invalid_col, white_to_move
        )
        assert not result.is_valid
        assert result.error_code == ValidationError.INVALID_COORDINATES.value
        assert result.error_message is not None
        assert 'coordinate' in result.error_message.lower()
        assert result.details is not None
    
    @given(
        piece_type=st.sampled_from(['P', 'p', 'R', 'r', 'N', 'n', 'B', 'b', 'Q', 'q', 'K', 'k']),
        position=valid_board_position(),
        white_to_move=st.booleans()
    )
    @settings(max_examples=5)
    def test_property_4_piece_specific_error_messages(
        self, piece_type, position, white_to_move
    ):
        """
        **Property 4 Extension: Piece-Specific Error Messages**
        
        Invalid moves for specific piece types should produce appropriate
        error codes and descriptive messages.
        """
        row, col = position
        board = [[None for _ in range(4)] for _ in range(5)]
        board[row][col] = piece_type
        
        # Generate an invalid move for this piece type
        invalid_moves = self._generate_invalid_moves_for_piece(piece_type, row, col)
        
        for to_row, to_col in invalid_moves:
            if not self._are_coordinates_valid(row, col, to_row, to_col):
                continue
            if to_row == row and to_col == col:
                continue
            
            # Check if it's the right turn
            is_white_piece = piece_type.isupper()
            if (white_to_move and not is_white_piece) or (not white_to_move and is_white_piece):
                continue
            
            result = self.validator.validate_move(
                board, row, col, to_row, to_col, white_to_move
            )
            
            if not result.is_valid:
                assert result.error_code is not None
                assert result.error_message is not None
                assert len(result.error_message) > 0
                assert result.details is not None
                
                # Verify piece-specific error codes
                piece_lower = piece_type.lower()
                if piece_lower == 'p':
                    assert result.error_code in [
                        ValidationError.INVALID_PAWN_MOVE.value,
                        ValidationError.INVALID_PIECE_MOVE.value
                    ]
                elif piece_lower == 'r':
                    assert result.error_code in [
                        ValidationError.INVALID_ROOK_MOVE.value,
                        ValidationError.PATH_BLOCKED.value,
                        ValidationError.INVALID_PIECE_MOVE.value
                    ]
                elif piece_lower == 'n':
                    assert result.error_code in [
                        ValidationError.INVALID_KNIGHT_MOVE.value,
                        ValidationError.INVALID_PIECE_MOVE.value
                    ]
                elif piece_lower == 'b':
                    assert result.error_code in [
                        ValidationError.INVALID_BISHOP_MOVE.value,
                        ValidationError.PATH_BLOCKED.value,
                        ValidationError.INVALID_PIECE_MOVE.value
                    ]
                elif piece_lower == 'q':
                    assert result.error_code in [
                        ValidationError.INVALID_QUEEN_MOVE.value,
                        ValidationError.PATH_BLOCKED.value,
                        ValidationError.INVALID_PIECE_MOVE.value
                    ]
                elif piece_lower == 'k':
                    assert result.error_code in [
                        ValidationError.INVALID_KING_MOVE.value,
                        ValidationError.INVALID_PIECE_MOVE.value
                    ]
    
    def _generate_invalid_moves_for_piece(
        self, piece_type: str, row: int, col: int
    ) -> List[Tuple[int, int]]:
        """Generate invalid moves for a specific piece type."""
        invalid_moves = []
        piece_lower = piece_type.lower()
        
        # Generate some obviously invalid moves for each piece type
        for to_row in range(5):
            for to_col in range(4):
                if to_row == row and to_col == col:
                    continue
                
                row_diff = abs(to_row - row)
                col_diff = abs(to_col - col)
                
                if piece_lower == 'p':
                    # Invalid pawn moves: sideways, backwards, too far forward
                    if (col_diff > 1 or row_diff > 2 or 
                        (col_diff == 1 and row_diff != 1) or
                        (col_diff == 0 and row_diff > 2)):
                        invalid_moves.append((to_row, to_col))
                
                elif piece_lower == 'r':
                    # Invalid rook moves: diagonal
                    if row_diff > 0 and col_diff > 0:
                        invalid_moves.append((to_row, to_col))
                
                elif piece_lower == 'n':
                    # Invalid knight moves: not L-shaped
                    if not ((row_diff == 2 and col_diff == 1) or (row_diff == 1 and col_diff == 2)):
                        invalid_moves.append((to_row, to_col))
                
                elif piece_lower == 'b':
                    # Invalid bishop moves: not diagonal
                    if row_diff != col_diff:
                        invalid_moves.append((to_row, to_col))
                
                elif piece_lower == 'q':
                    # Invalid queen moves: knight-like moves
                    if ((row_diff == 2 and col_diff == 1) or (row_diff == 1 and col_diff == 2)):
                        invalid_moves.append((to_row, to_col))
                
                elif piece_lower == 'k':
                    # Invalid king moves: more than one square
                    if row_diff > 1 or col_diff > 1:
                        invalid_moves.append((to_row, to_col))
        
        return invalid_moves[:10]  # Limit to avoid too many test cases
    
    @given(
        board=chess_board(),
        position=valid_board_position(),
        white_to_move=st.booleans()
    )
    @settings(max_examples=5)
    def test_property_4_error_message_structure_consistency(
        self, board, position, white_to_move
    ):
        """
        **Property 4 Extension: Error Message Structure**
        
        All error messages should have consistent structure with required fields.
        """
        row, col = position
        
        # Test with various invalid scenarios
        invalid_scenarios = [
            # Same square
            (row, col, row, col),
            # Invalid coordinates (if possible)
            (row, col, -1, 0) if row != -1 else (row, col, 5, 0),
        ]
        
        for from_row, from_col, to_row, to_col in invalid_scenarios:
            result = self.validator.validate_move(
                board, from_row, from_col, to_row, to_col, white_to_move
            )
            
            if not result.is_valid:
                # Verify error structure
                assert hasattr(result, 'is_valid')
                assert hasattr(result, 'error_code')
                assert hasattr(result, 'error_message')
                assert hasattr(result, 'details')
                
                assert result.error_code is not None
                assert isinstance(result.error_code, str)
                assert len(result.error_code) > 0
                
                assert result.error_message is not None
                assert isinstance(result.error_message, str)
                assert len(result.error_message) > 0
                
                assert result.details is not None
                assert isinstance(result.details, dict)
    
    # Additional property tests for edge cases
    
    @given(
        piece_type=st.sampled_from(['P', 'p', 'R', 'r', 'N', 'n', 'B', 'b', 'Q', 'q', 'K', 'k']),
        position=valid_board_position()
    )
    @settings(max_examples=5)
    def test_property_get_piece_moves_consistency(self, piece_type, position):
        """
        **Property Extension: get_piece_moves Consistency**
        
        The get_piece_moves method should return moves that are consistent
        with the validate_move method.
        """
        row, col = position
        board = [[None for _ in range(4)] for _ in range(5)]
        board[row][col] = piece_type
        
        # Get all possible moves for this piece
        moves = self.validator.get_piece_moves(board, piece_type, row, col)
        
        # Each returned move should be valid according to validate_move
        is_white_piece = piece_type.isupper()
        for to_row, to_col in moves:
            result = self.validator.validate_move(
                board, row, col, to_row, to_col, white_to_move=is_white_piece
            )
            assert result.is_valid, (
                f"get_piece_moves returned invalid move for {piece_type} "
                f"from ({row}, {col}) to ({to_row}, {to_col}): {result.error_message}"
            )
    
    @given(
        board=chess_board(),
        position=valid_board_position(),
        piece_type=st.sampled_from(['P', 'p', 'R', 'r', 'N', 'n', 'B', 'b', 'Q', 'q', 'K', 'k'])
    )
    @settings(max_examples=5)
    def test_property_get_piece_moves_empty_when_no_piece(self, board, position, piece_type):
        """
        **Property Extension: get_piece_moves Empty Result**
        
        get_piece_moves should return empty list when no piece at position
        or wrong piece type.
        """
        row, col = position
        
        # Test with empty square
        empty_board = [[None for _ in range(4)] for _ in range(5)]
        moves = self.validator.get_piece_moves(empty_board, piece_type, row, col)
        assert moves == []
        
        # Test with wrong piece type
        board[row][col] = 'P' if piece_type.lower() != 'p' else 'R'
        moves = self.validator.get_piece_moves(board, piece_type, row, col)
        assert moves == []