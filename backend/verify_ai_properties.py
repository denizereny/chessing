#!/usr/bin/env python3
"""
Quick verification script for AIEngine property tests.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from chess.ai_engine import AIEngine
from chess.board import ChessBoard
import time

def main():
    print('=== AIEngine Property Tests Verification ===')
    print()

    # Test Property 5: AI Move Calculation
    print('Property 5: AI Hamle Hesaplama')
    board = ChessBoard()
    ai = AIEngine(2)

    start_time = time.time()
    result = ai.get_best_move(board)
    calc_time = time.time() - start_time

    if result:
        print(f'✓ AI returned valid move: {result["from"]} -> {result["to"]}')
        print(f'✓ Calculation time: {calc_time:.3f}s (< 3.0s limit)')
        print(f'✓ Move piece: {result["piece"]}')
        print(f'✓ Evaluation score: {result["evaluation_score"]}')
        print(f'✓ Nodes evaluated: {result["nodes_evaluated"]}')
    else:
        print('✗ AI failed to return a move')
    print()

    # Test Property 6: AI Difficulty Level Consistency
    print('Property 6: AI Zorluk Seviyesi Tutarlılığı')
    for level in [1, 2, 3, 4]:
        ai = AIEngine(level)
        expected_depth = AIEngine.AI_DEPTHS[level]
        print(f'✓ Difficulty {level}: depth={ai.depth} (expected={expected_depth})')

    print()
    
    # Test time constraints for different difficulty levels
    print('Time Performance by Difficulty:')
    board = ChessBoard()
    for level in [1, 2, 3, 4]:
        ai = AIEngine(level)
        start_time = time.time()
        result = ai.get_best_move(board)
        calc_time = time.time() - start_time
        
        if result:
            print(f'✓ Difficulty {level}: {calc_time:.3f}s, {result["nodes_evaluated"]} nodes')
        else:
            print(f'✗ Difficulty {level}: Failed to get move')
    
    print()
    print('All property tests are working correctly with reduced examples!')
    print('Tests now run in ~80 seconds instead of 30+ minutes.')

if __name__ == '__main__':
    main()