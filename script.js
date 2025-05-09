// 変更前 (script.js の updatePlayerPiecePosition 関数内の一部)
    // const offsetX = - (piece.offsetWidth / 2);
    // const offsetY = - (piece.offsetHeight / 2);
    // piece.style.left = `calc(${square.x}% - ${piece.offsetWidth / 2}px)`;
    // piece.style.top = `calc(${square.y}% - ${piece.offsetHeight / 2}px)`;

    // 変更後 (script.js の updatePlayerPiecePosition 関数内の一部)
    function updatePlayerPiecePosition(playerIndex) {
        const squareIndex = playerPositions[playerIndex];
        const square = squares[squareIndex];
        const piece = playerPieces[playerIndex];

        if (square && piece) {
            // コマの現在の実際の幅と高さを取得
            const pieceWidth = piece.offsetWidth;
            const pieceHeight = piece.offsetHeight;

            // 割合で位置を計算し、コマのサイズの半分を引いて中心に配置
            piece.style.left = `calc(${square.x}% - ${pieceWidth / 2}px)`;
            piece.style.top = `calc(${square.y}% - ${pieceHeight / 2}px)`;

            // 複数のコマが同じマスにいる場合のオフセット（簡易版）
            let offsetMagnitude = 5; // ずらす量（ピクセル）
            // スマホではオフセット量を小さくするなどの調整も検討できます
            if (window.innerWidth < 600) {
                offsetMagnitude = 3;
            }
            let overlapCount = 0;
            let transformX = 0;
            let transformY = 0;

            for (let i = 0; i < numPlayers; i++) {
                if (i !== playerIndex && playerPositions[i] === squareIndex) {
                    overlapCount++;
                    // 簡単な例として、プレイヤー番号によって少し位置をずらす
                    switch((playerIndex + overlapCount) % 4) { // 他のプレイヤーとの組み合わせでずらす方向を変える
                        case 0: transformX += offsetMagnitude; transformY += offsetMagnitude; break;
                        case 1: transformX -= offsetMagnitude; transformY += offsetMagnitude; break;
                        case 2: transformX += offsetMagnitude; transformY -= offsetMagnitude; break;
                        case 3: transformX -= offsetMagnitude; transformY -= offsetMagnitude; break;
                    }
                }
            }
            piece.style.transform = `translate(${transformX}px, ${transformY}px)`;
        }
    }
    }

    // 初期状態ではサイコロボタンを無効化
    rollDiceButton.disabled = true;
});
