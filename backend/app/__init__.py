"""
Flask Chess Backend Application Package
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from config.config import Config
import logging

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize logging infrastructure
    from app.utils.logging_config import setup_logging
    loggers = setup_logging(
        app_name='flask_chess_backend',
        log_level=app.config.get('LOG_LEVEL', 'INFO'),
        log_dir=app.config.get('LOG_DIR', None),
        enable_console=True,
        enable_file=True
    )
    
    # Store loggers in app config for access throughout the app
    app.config['LOGGERS'] = loggers
    
    # Initialize logging middleware
    from app.middleware import LoggingMiddleware
    logging_middleware = LoggingMiddleware(
        app=app,
        api_logger=loggers['api'],
        error_logger=loggers['error'],
        performance_logger=loggers['performance']
    )
    
    # Initialize performance monitoring middleware
    from app.middleware.performance_middleware import performance_tracking
    performance_tracking(app)
    
    # Initialize CORS
    CORS(app, origins=['http://localhost:8080', 'http://127.0.0.1:8080'])
    
    # Register global error handlers for non-API routes
    @app.errorhandler(404)
    def not_found(error):
        """Handle not found errors"""
        from datetime import datetime, timezone
        return jsonify({
            'error_code': 'NOT_FOUND',
            'message': 'The requested resource was not found',
            'details': {},
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'path': request.path if request else None
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        """Handle method not allowed errors"""
        from datetime import datetime, timezone
        return jsonify({
            'error_code': 'METHOD_NOT_ALLOWED',
            'message': f'Method {request.method} is not allowed for this endpoint',
            'details': {},
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'path': request.path if request else None
        }), 405

    @app.errorhandler(500)
    def internal_error(error):
        """Handle internal server errors"""
        from datetime import datetime, timezone
        return jsonify({
            'error_code': 'INTERNAL_ERROR',
            'message': 'An internal server error occurred',
            'details': {},
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'path': request.path if request else None
        }), 500
    
    # Register blueprints
    from app.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Register auth blueprint
    from app.api.auth_routes import auth_bp
    app.register_blueprint(auth_bp)
    
    return app