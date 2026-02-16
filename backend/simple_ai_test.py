#!/usr/bin/env python3
"""
Simple test for AIEngine implementation.
"""

import sys
import os
import time

# Import modules directly
sys.path.append(os.path.join(os.path.dirname(__file__), 'app', 'chess'))

from board import ChessBoard
from ai_engine import AIEngine


def test_ai():
    """Simple AI test."""
    print("🤖 Simple AIEngine Test")
    print("=" * 25)
    
    # Create board and AI
    board = ChessBoard()
    ai = AIEngine(difficulty_level=2)
    
    print(f"AI difficulty: {ai.difficulty_level}")
    print(f"Search depth: {ai.depth}")
    
    # Test position evaluation
    evaluation = ai.evaluate_position(board)
    print(f"Starting position evaluation: {evaluation}")
    
    # Get best move
    print("\nCalculating best move...")
    start_time = time.time()
    best_move = ai.get_best_move(board)
    calc_time = time.time() - start_time
    
    if best_move:
        print(f"✅ Best move: {best_move['piece']} from {best_move['from']} to {best_move['to']}")
        print(f"Calculation time: {calc_time:.3f}s")
        print(f"Evaluation score: {best_move['evaluation_score']}")
        print(f"Nodes evaluated: {best_move['nodes_evaluated']}")
        
        # Test time constraint
        if calc_time <= 3.0:
            print("✅ Within 3-second time limit")
        else:
            print("⚠️ Exceeded time limit")
            
        # Test different difficulty levels
        print(f"\nTesting different difficulty levels:")
        for level in [1, 2, 3, 4]:
            ai.set_difficulty(level)
            start = time.time()
            move = ai.get_best_move(board)
            duration = time.time() - start
            if move:
                print(f"Level {level} (depth {ai.depth}): {duration:.3f}s, {move['nodes_evaluated']} nodes")
        
        print(f"\n🎉 AIEngine test completed successfully!")
        return True
    else:
        print("❌ No move found!")
        return False


if __name__ == "__main__":
    try:
        test_ai()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)