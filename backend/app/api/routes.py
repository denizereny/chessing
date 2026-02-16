"""
API Routes for Chess Game
"""
from flask import jsonify, request
from app.api import bp
from app.session.session_manager import SessionManager
from app.chess.board import ChessBoard
from app.chess.ai_engine import AIEngine
from app.api.errors import (
    ErrorHandler, ValidationError, ChessEngineError, InvalidMoveError, 
    AIError, SessionError, APIError, NotAITurnError
)
from app.session.exceptions import SessionNotFoundError, SessionExpiredError
from app.utils.validation import (
    validate_input, validate_move_request, validate_game_request, InputValidator
)
from app.utils.security import (
    threat_detector, audit_logger, SecurityHeaders
)
import time
import logging

# Initialize session manager
session_manager = SessionManager()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@bp.route('/health', methods=['GET'])
@validate_input(check_rate_limit=False)  # Health check doesn't need rate limiting
def health_check():
    """Health check endpoint"""
    logger.info("Health check requested")
    response = jsonify({
        'status': 'healthy',
        'message': 'Flask Chess Backend is running',
        'version': '1.0.0',
        'timestamp': time.time()
    })
    return SecurityHeaders.apply_security_headers(response)

@bp.route('/metrics', methods=['GET'])
@validate_input(check_rate_limit=False)  # Metrics endpoint doesn't need rate limiting
def get_metrics():
    """Get performance metrics"""
    try:
        from app.middleware.performance_middleware import get_performance_monitor
        from app.chess.ai_cache import get_ai_cache
        
        monitor = get_performance_monitor()
        ai_cache = get_ai_cache()
        
        metrics = {
            'performance': monitor.get_metrics(),
            'ai_cache': ai_cache.get_all_stats(),
            'session': session_manager.get_memory_usage_info()
        }
        
        response = jsonify(metrics)
        return SecurityHeaders.apply_security_headers(response)
    except Exception as e:
        logger.error(f"Error getting metrics: {str(e)}", exc_info=True)
        return ErrorHandler.handle_generic_error(e, 'METRICS_ERROR', 500)

@bp.route('/game/new', methods=['POST'])
@validate_input(
    optional_fields=['ai_difficulty', 'player_color', 'custom_position'],
    max_requests=20  # Limit game creation to 20 per hour
)
@validate_game_request
def new_game():
    """Create a new chess game"""
    try:
        # Get client IP for logging
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        # Log the request
        logger.info(f"New game request from {ip_address}")
        
        # Get validated data from middleware
        data = getattr(request, 'validated_data', {})
        
        # Extract parameters with defaults (already validated by middleware)
        ai_difficulty = data.get('ai_difficulty', 2)
        player_color = data.get('player_color', 'white')
        custom_position = data.get('custom_position', None)
        
        # Create new session
        try:
            session_id = session_manager.create_session()
            session = session_manager.get_session(session_id)
            
            if not session:
                raise SessionError('Failed to create game session')
                
        except Exception as e:
            audit_logger.log_security_event(
                event_type="SESSION_CREATION_FAILED",
                ip_address=ip_address,
                details={'error': str(e)},
                severity="ERROR"
            )
            raise SessionError(f'Session creation failed: {str(e)}')
        
        # Configure session
        session.ai_difficulty = ai_difficulty
        session.player_color = player_color
        
        # Set up custom position if provided
        if custom_position:
            try:
                session.chess_board.set_custom_position(custom_position)
            except Exception as e:
                audit_logger.log_validation_failure(
                    ip_address=ip_address,
                    field='custom_position',
                    value=str(custom_position)[:100],
                    reason=str(e)
                )
                raise ValidationError(
                    message='Invalid custom position provided',
                    field_errors={'custom_position': str(e)},
                    details={'position_format': 'Expected 5x4 array of piece strings or null'}
                )
        
        # Get valid moves for current position
        try:
            valid_moves = session.chess_board.get_all_valid_moves_dict()
        except Exception as e:
            raise ChessEngineError(f'Failed to calculate valid moves: {str(e)}')
        
        # Log successful game creation
        logger.info(f"New game created: session_id={session_id}, difficulty={ai_difficulty}, player_color={player_color}")
        audit_logger.log_security_event(
            event_type="GAME_CREATED",
            ip_address=ip_address,
            details={
                'session_id': session_id,
                'ai_difficulty': ai_difficulty,
                'player_color': player_color,
                'has_custom_position': custom_position is not None
            }
        )
        
        response = jsonify({
            'session_id': session_id,
            'board_state': session.chess_board.to_dict()['board'],
            'white_to_move': session.chess_board.white_to_move,
            'valid_moves': valid_moves,
            'ai_difficulty': ai_difficulty,
            'player_color': player_color,
            'game_over': session.chess_board.is_game_over(),
            'winner': session.chess_board.get_winner()
        })
        return SecurityHeaders.apply_security_headers(response)
        
    except (ValidationError, ChessEngineError, SessionError, APIError):
        # Re-raise custom errors to be handled by error handlers
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating new game: {str(e)}", exc_info=True)
        audit_logger.log_security_event(
            event_type="GAME_CREATION_ERROR",
            ip_address=ip_address,
            details={'error': str(e)},
            severity="ERROR"
        )
        return ErrorHandler.handle_generic_error(e, 'GAME_CREATION_ERROR', 500)

@bp.route('/game/<session_id>/move', methods=['POST'])
@validate_input(
    required_fields=['from_position', 'to_position'],
    max_requests=200  # Allow more moves per hour
)
@validate_move_request
def make_move(session_id):
    """Make a move in the game"""
    try:
        # Get client IP for logging
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        # Log the request
        logger.info(f"Move request for session {session_id} from {ip_address}")
        
        # Analyze request for threats
        user_agent = request.headers.get('User-Agent', 'Unknown')
        threat_analysis = threat_detector.analyze_request(
            ip_address=ip_address,
            user_agent=user_agent,
            endpoint=request.endpoint,
            method=request.method,
            data=getattr(request, 'validated_data', {})
        )
        
        # Block if high threat detected
        if threat_analysis['should_block']:
            audit_logger.log_blocked_request(
                ip_address=ip_address,
                reason=f"High threat score: {threat_analysis['threat_score']}",
                endpoint=request.endpoint,
                method=request.method
            )
            raise APIError(
                error_code='THREAT_DETECTED',
                message='Request blocked due to suspicious activity',
                status_code=403,
                details={'threat_level': threat_analysis['threat_level']}
            )
        
        # Get session (session_id already validated by middleware)
        try:
            session = session_manager.get_session(session_id)
        except (SessionNotFoundError, SessionExpiredError):
            threat_detector.record_failed_attempt(ip_address, 'invalid_session')
            # These will be handled by the error handlers
            raise
        
        # Check if game is over
        if session.chess_board.is_game_over():
            raise ChessEngineError(
                message='Game has already ended',
                details={
                    'winner': session.chess_board.get_winner(),
                    'game_over': True
                }
            )
        
        # Get validated move data from middleware
        data = getattr(request, 'validated_data', {})
        from_pos = data['from_position']  # Already validated as tuple
        to_pos = data['to_position']      # Already validated as tuple
        
        # Make the move
        try:
            captured_piece = session.chess_board.make_move(from_pos, to_pos)
            
            # Update session
            session_manager.update_session(session_id, session.chess_board)
            
            # Get valid moves for new position
            valid_moves = session.chess_board.get_all_valid_moves_dict()
            
            # Create move notation
            move_notation = f"{chr(97 + from_pos[1])}{from_pos[0] + 1}-{chr(97 + to_pos[1])}{to_pos[0] + 1}"
            
            # Log the successful move
            logger.info(f"Move made: session_id={session_id}, move={move_notation}, captured={captured_piece}")
            audit_logger.log_security_event(
                event_type="MOVE_MADE",
                ip_address=ip_address,
                details={
                    'session_id': session_id,
                    'move_notation': move_notation,
                    'captured_piece': captured_piece,
                    'game_over': session.chess_board.is_game_over()
                }
            )
            
            response = jsonify({
                'success': True,
                'board_state': session.chess_board.to_dict()['board'],
                'white_to_move': session.chess_board.white_to_move,
                'captured_piece': captured_piece,
                'game_over': session.chess_board.is_game_over(),
                'winner': session.chess_board.get_winner(),
                'valid_moves': valid_moves,
                'move_notation': move_notation,
                'move_count': len(session.chess_board.move_history)
            })
            return SecurityHeaders.apply_security_headers(response)
            
        except ValueError as e:
            # Record failed move attempt
            threat_detector.record_failed_attempt(ip_address, 'invalid_move')
            audit_logger.log_validation_failure(
                ip_address=ip_address,
                field='move',
                value=f"{from_pos}->{to_pos}",
                reason=str(e)
            )
            raise InvalidMoveError(
                reason=str(e),
                from_pos=from_pos,
                to_pos=to_pos
            )
            
    except (ValidationError, ChessEngineError, InvalidMoveError, SessionError, APIError, SessionNotFoundError, SessionExpiredError):
        # Re-raise custom errors to be handled by error handlers
        raise
    except Exception as e:
        logger.error(f"Unexpected error making move: session_id={session_id}, error={str(e)}", exc_info=True)
        audit_logger.log_security_event(
            event_type="MOVE_ERROR",
            ip_address=ip_address,
            details={'session_id': session_id, 'error': str(e)},
            severity="ERROR"
        )
        return ErrorHandler.handle_generic_error(e, 'MOVE_PROCESSING_ERROR', 500)

@bp.route('/game/<session_id>/state', methods=['GET'])
@validate_input(check_rate_limit=True, max_requests=300)  # Allow frequent state checks
@validate_game_request
def get_game_state(session_id):
    """Get current game state"""
    try:
        # Get client IP for logging
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        # Log the request
        logger.info(f"Game state request for session {session_id}")
        
        # Get session (session_id already validated by middleware)
        try:
            session = session_manager.get_session(session_id)
        except (SessionNotFoundError, SessionExpiredError):
            threat_detector.record_failed_attempt(ip_address, 'invalid_session')
            # These will be handled by the error handlers
            raise
        
        # Get valid moves
        try:
            valid_moves = session.chess_board.get_all_valid_moves_dict()
        except Exception as e:
            raise ChessEngineError(f'Failed to calculate valid moves: {str(e)}')
        
        # Get board state
        try:
            board_dict = session.chess_board.to_dict()
        except Exception as e:
            raise ChessEngineError(f'Failed to serialize board state: {str(e)}')
        
        response = jsonify({
            'session_id': session_id,
            'board_state': board_dict['board'],
            'white_to_move': session.chess_board.white_to_move,
            'move_history': board_dict['move_history'],
            'captured_pieces': board_dict['captured_pieces'],
            'game_over': session.chess_board.is_game_over(),
            'winner': session.chess_board.get_winner(),
            'move_count': len(session.chess_board.move_history),
            'valid_moves': valid_moves,
            'ai_difficulty': session.ai_difficulty,
            'player_color': session.player_color,
            'created_at': session.created_at.isoformat(),
            'last_activity': session.last_activity.isoformat()
        })
        return SecurityHeaders.apply_security_headers(response)
        
    except (ChessEngineError, SessionError, APIError):
        # Re-raise custom errors to be handled by error handlers
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting game state: session_id={session_id}, error={str(e)}", exc_info=True)
        audit_logger.log_security_event(
            event_type="STATE_RETRIEVAL_ERROR",
            ip_address=ip_address,
            details={'session_id': session_id, 'error': str(e)},
            severity="ERROR"
        )
        return ErrorHandler.handle_generic_error(e, 'STATE_RETRIEVAL_ERROR', 500)

@bp.route('/game/<session_id>/ai-move', methods=['POST'])
@validate_input(max_requests=50)  # Limit AI move requests
@validate_game_request
def ai_move(session_id):
    """Request AI to make a move"""
    try:
        # Get client IP for logging
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        # Log the request
        logger.info(f"AI move request for session {session_id}")
        
        # Get session (session_id already validated by middleware)
        try:
            session = session_manager.get_session(session_id)
        except (SessionNotFoundError, SessionExpiredError):
            threat_detector.record_failed_attempt(ip_address, 'invalid_session')
            # These will be handled by the error handlers
            raise
        
        # Check if game is over
        if session.chess_board.is_game_over():
            raise ChessEngineError(
                message='Game has already ended',
                details={
                    'winner': session.chess_board.get_winner(),
                    'game_over': True
                }
            )
        
        # Check if it's AI's turn
        ai_is_white = session.player_color == 'black'
        if session.chess_board.white_to_move != ai_is_white:
            threat_detector.record_failed_attempt(ip_address, 'not_ai_turn')
            raise NotAITurnError(
                message='It is not AI\'s turn to move',
                details={
                    'white_to_move': session.chess_board.white_to_move,
                    'ai_is_white': ai_is_white,
                    'player_color': session.player_color
                }
            )
        
        # Initialize AI engine
        try:
            ai_engine = AIEngine(session.ai_difficulty)
        except Exception as e:
            raise AIError(f'Failed to initialize AI engine: {str(e)}')
        
        # Calculate AI move
        start_time = time.time()
        try:
            move_result = ai_engine.get_best_move(session.chess_board)
            calculation_time = time.time() - start_time
            
            if not move_result:
                raise ChessEngineError(
                    message='No valid moves available for AI',
                    details={
                        'calculation_time': round(calculation_time, 3),
                        'board_state': session.chess_board.to_dict()['board']
                    }
                )
            
            move_from = move_result['from']
            move_to = move_result['to']
            
            # Make the AI move
            captured_piece = session.chess_board.make_move(move_from, move_to)
            
            # Update session
            session_manager.update_session(session_id, session.chess_board)
            
            # Get valid moves for new position
            valid_moves = session.chess_board.get_all_valid_moves_dict()
            
            # Create move notation
            move_notation = f"{chr(97 + move_from[1])}{move_from[0] + 1}-{chr(97 + move_to[1])}{move_to[0] + 1}"
            
            # Get evaluation score from the move result
            evaluation_score = move_result.get('evaluation_score', 0)
            
            # Log the successful AI move
            logger.info(f"AI move made: session_id={session_id}, move={move_notation}, time={calculation_time:.3f}s, score={evaluation_score}")
            audit_logger.log_security_event(
                event_type="AI_MOVE_MADE",
                ip_address=ip_address,
                details={
                    'session_id': session_id,
                    'move_notation': move_notation,
                    'calculation_time': round(calculation_time, 3),
                    'evaluation_score': evaluation_score,
                    'captured_piece': captured_piece
                }
            )
            
            response = jsonify({
                'move_from': move_from,
                'move_to': move_to,
                'board_state': session.chess_board.to_dict()['board'],
                'white_to_move': session.chess_board.white_to_move,
                'captured_piece': captured_piece,
                'game_over': session.chess_board.is_game_over(),
                'winner': session.chess_board.get_winner(),
                'calculation_time': round(calculation_time, 3),
                'evaluation_score': evaluation_score,
                'move_notation': move_notation,
                'valid_moves': valid_moves,
                'move_count': len(session.chess_board.move_history)
            })
            return SecurityHeaders.apply_security_headers(response)
            
        except Exception as ai_error:
            calculation_time = time.time() - start_time
            logger.error(f"AI calculation error: session_id={session_id}, error={str(ai_error)}, time={calculation_time:.3f}s", exc_info=True)
            audit_logger.log_security_event(
                event_type="AI_CALCULATION_ERROR",
                ip_address=ip_address,
                details={
                    'session_id': session_id,
                    'error': str(ai_error),
                    'calculation_time': round(calculation_time, 3)
                },
                severity="ERROR"
            )
            raise AIError(
                message='AI failed to calculate move',
                calculation_time=round(calculation_time, 3),
                details={'error_type': type(ai_error).__name__}
            )
            
    except (ChessEngineError, SessionError, AIError, APIError, NotAITurnError, SessionNotFoundError, SessionExpiredError):
        # Re-raise custom errors to be handled by error handlers
        raise
    except Exception as e:
        logger.error(f"Unexpected error in AI move: session_id={session_id}, error={str(e)}", exc_info=True)
        audit_logger.log_security_event(
            event_type="AI_MOVE_ERROR",
            ip_address=ip_address,
            details={'session_id': session_id, 'error': str(e)},
            severity="ERROR"
        )
        return ErrorHandler.handle_generic_error(e, 'AI_MOVE_ERROR', 500)