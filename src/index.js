import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'


class Square extends React.Component {

    render() {
        const classes = `${this.props.value}  square`;
            return(<button className={classes} onClick={this.props.onClick}/>);
    }
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                // value={i}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    renderRow(rowNumber) {
        var squares = [];
        for (let i = 0; i < this.props.length; i++) {
            squares.push(this.renderSquare(rowNumber * this.props.length + i));
        }
        return (
            <div key={rowNumber}>
                {squares}
            </div>
        );
    }

    renderRows() {
        var rows = [];
        for (var i = 0; i < this.props.length; i++) {
            rows.push(this.renderRow(i));
        }

        return rows;
    }

    render() {
        return this.renderRows();
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        const boardLength = 8;

        const initSquares = Array(boardLength * boardLength).fill(null);
        [
            initSquares[boardLength * 3 + 3],
            initSquares[boardLength * 3 + 4],
            initSquares[boardLength * 4 + 4],
            initSquares[boardLength * 4 + 3]
        ] = ['B', 'W', 'B', 'W'];

        this.state = {
            boardLength: boardLength,
            history: [{
                squares: initSquares
            }],
            stepNumber: 0,
            blacksTurn: true
        };
    }

    getXYPos(position, boardLength) {
        return [position % boardLength, (position - position % boardLength) / boardLength];
    }


    flipSquares(board, position, blacksTurn) {
        // flip currently selected square first
        board[position] = blacksTurn ? 'B' : 'W';

        const boardLength = this.state.boardLength;
        const boardSize = boardLength * boardLength;
        let updatedBoard = null;

        let [startX, startY] = this.getXYPos(position, boardLength);

        // for each neighbouring cell
        // clockwise, starting from the northern neighbour
        // [N, NE, E, SE, S, SW, W, NW]
        [
            -boardLength,
            -(boardLength + 1),
            1,
            (boardLength + 1),
            boardLength,
            (boardLength - 1),
            -1,
            -(boardLength - 1)
        ].forEach((offset) => {
            // if board has been updated, use that. otherwise start with the original board
            let currentBoard = updatedBoard ? updatedBoard.slice() : board.slice();
            let [lastXPos, lastYPos] = [startX, startY];

            let squareHasFlipped = false;

            for (let iter = position + offset; iter < boardSize; iter = iter + offset) {
                let [xPos, yPos] = this.getXYPos(iter, boardLength);

                // check if we have left the board
                // ie current position is on a new row or column
                if (Math.abs(lastXPos - xPos) > 1 || Math.abs(lastYPos - yPos) > 1) {
                    break;
                }

                // Next square was occupied with the opposite color
                if (currentBoard[iter] === (!blacksTurn ? 'B' : 'W')) {
                    currentBoard[iter] = blacksTurn ? 'B' : 'W';
                    squareHasFlipped = true;
                    [lastXPos, lastYPos] = [xPos, yPos];
                    continue;
                }
                // update board if a square has been flipped and the same colour has been reached
                else if ((currentBoard[iter] === (blacksTurn ? 'B' : 'W')) && squareHasFlipped) {
                    updatedBoard = currentBoard.slice();
                }
                break;
            }
        });

        return updatedBoard;

    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];

        const squares = this.flipSquares(current.squares.slice(), i, this.state.blacksTurn);
        if (squares === null) {
            return;
        }


        this.setState({
            history: history.concat([
                {
                    squares: squares
                }
            ]),
            stepNumber: history.length,
            blacksTurn: !this.state.blacksTurn
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            blacksTurn: (step % 2) === 0
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        // const winner = calculateWinner(current.squares);
        const boardLength = this.state.boardLength;

        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move :
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        // if (winner) {
        //     status = "Winner: " + winner;
        // } else {
        //     status = "Next player: " + (this.state.blacksTurn ? "B" : "W");
        // }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        length={boardLength}
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    {/*<div>{status}</div>*/}
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}


// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

