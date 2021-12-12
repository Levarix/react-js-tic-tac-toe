import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    const className = "square" + (props.highlight ? " highlight" : "");
    return (
      <button
          className={className}
          onClick={props.onClick}
      >
          {props.value}
      </button>
    );
}

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
            return {
                winner: squares[a],
                lines: lines[i],
            };
        }
    }
    return {
        winner: null,
        lines: null,
    };
}

function calculatePosition(index) {
    const rows = new Map();
    const columns = new Map();

    rows.set(1, [0, 1, 2]);
    rows.set(2, [3, 4, 5]);
    rows.set(3, [6, 7, 8]);

    columns.set(1, [0, 3, 6]);
    columns.set(2, [1, 4, 7]);
    columns.set(3, [2, 5, 8]);


    let row;
    for (let [k, v] of rows.entries()) {
        for (let value of v) {
            if (index === value) row = k;
        }
    }

    let column;
    for (let [k, v] of columns.entries()) {
        for (let value of v) {
            if (index === value) column = k;
        }
    }

    return {
        row: row,
        column: column,
    };

}

class Board extends React.Component {

    renderSquare(i) {
        const winnerLine = this.props.winnerLines
        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                highlight={winnerLine && winnerLine.includes(i)}
            />
        );
    }

    renderBoard(){
        let board = [];
        let counter = 0;
        for (let i = 0; i < 3; i++) {
            let row = [];
            for (let j = 0; j < 3; j++) {
                row.push(this.renderSquare(counter));
                counter++;
            }
            board.push(<div className="board-row" key={i}>{row}</div>)
        }
        return board;
    }

    render() {
        return (
            <div>{this.renderBoard()}</div>

        );
    }
}

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                position: new Map(),
            }],
            stepNumber: 0,
            xIsNext: true,
            orderIsAsc: true,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const position = calculatePosition(i);

        if(calculateWinner(squares).winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';

        this.setState({
            history: history.concat([{
                squares: squares,
                position: position,
            }]),
            xIsNext : !this.state.xIsNext,
            stepNumber: history.length,
        });
    }

    handleRevertSort() {
        this.setState({
            orderIsAsc: !this.state.orderIsAsc,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winnerInfo = calculateWinner(current.squares);
        const winner = winnerInfo.winner;

        const moves = history.map((step, move) => {
            let desc = move ?
                'Przejdź do ruchu #' + move + " | (kolumna: " + step.position.column + " wiersz: " + step.position.row + ")":
                'Przejdź na początek gry';

            if (move === this.state.stepNumber) desc = <b>{desc}</b>;

            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = "Wygrywa: " + winner;
        } else {
            status = "Następny gracz: " + (this.state.xIsNext ? "X" : "O");
        }

        if (current.squares.every((i) => {return i !== null}) && !winner) status = "Remis";

        if (this.state.orderIsAsc) moves.reverse();

        const revertSorting = <button onClick={() => this.handleRevertSort()}>Odwróć sortowanie</button>
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        winnerLines={winnerInfo.lines}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>{revertSorting}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
