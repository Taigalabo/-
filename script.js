document.addEventListener('DOMContentLoaded', () => {
    const boardImage = document.getElementById('game-board-img');
    const gameBoardContainer = document.querySelector('.game-board-container');
    const rollDiceButton = document.getElementById('roll-dice-button');
    const diceResultDisplay = document.getElementById('dice-result');
    const currentPlayerDisplay = document.getElementById('current-player');
    const currentPositionDisplay = document.getElementById('current-position');
    const eventMessageDisplay = document.getElementById('event-message');
    const numPlayersInput = document.getElementById('num-players');
    const startGameButton = document.getElementById('start-game-button');

    let numPlayers = 1;
    let currentPlayer = 1;
    let playerPositions = []; // 各プレイヤーの現在のマス番号
    let playerPieces = []; // 各プレイヤーのコマのDOM要素

    // すごろくのマス定義 (座標とイベント)
    // 注意: 各マスの座標 (x, y) は、画像に合わせて手動で調整する必要があります。
    // x は左からの割合 (0% - 100%)、 y は上からの割合 (0% - 100%)
    const squares = [
        { name: "スタート", x: 10, y: 85, event: "スタート！冒険の始まりだ！" }, // 0
        { name: "星落としの湖", x: 10, y: 65, event: "「ストーリー進捗、良く使う編成を教えて！」" }, // 1
        { name: "モンド城", x: 10, y: 45, event: "「一番好きな原神の国は？」" }, // 2
        { name: "風立ちの地", x: 10, y: 25, event: "「好きな原神のマップ・景色は？」" }, // 3
        { name: "奔狼領", x: 20, y: 15, event: "「一番最初に引いた限定星5キャラは？」" }, // 4
        { name: "フォンテーヌ廷", x: 30, y: 35, event: "「今までで一番の神引きは？」" }, // 5
        { name: "原神を始めたきっかけは？", x: 30, y: 60, event: "「原神を始めたきっかけは？」" }, // 6
        { name: "ウェネトトンネル", x: 35, y: 88, event: "「現在のキャラで通常攻撃を一発振り、会心だったら3マス進む」", special: "conditional_move", condition_value: 3 }, // 7
        { name: "こだよの亭", x: 45, y: 60, event: "「限定キャラが一体貰えるなら誰が欲しい？」" }, // 8
        { name: "ペトリコール", x: 45, y: 35, event: "「他にハマっているゲームは？」" }, // 9
        { name: "アアル村", x: 50, y: 88, event: "「好きな魔神・伝説任務は？」" }, // 10
        { name: "流浪の衆", x: 60, y: 60, event: "「自慢の聖遺物があれば見せてください！」" }, // 11
        { name: "樹木の民", x: 60, y: 35, event: "「神の目が貰えるなら何元素がいい？」" }, // 12
        { name: "スメールシティ", x: 65, y: 88, event: "「一番好きなイベントは？」" }, // 13
        { name: "層岩巨淵", x: 70, y: 15, event: "「次に育てたいキャラは？」" }, // 14
        { name: "超英雄", x: 75, y: 35, event: "「一番使っているキャラは？」" }, // 15
        { name: "浅瀬神社", x: 80, y: 88, event: "「よく回っている聖遺物秘境は？」" }, // 16
        { name: "望舒旅館", x: 80, y: 45, event: "「あなたの推しについて教えて！」" }, // 17
        { name: "海祇島", x: 88, y: 75, event: "「次に引きたいキャラは？」" }, // 18
        { name: "鳴神大社", x: 88, y: 55, event: "「好きな爆発のカットインは？」" }, // 19
        { name: "稲妻城", x: 88, y: 25, event: "「好きor嫌いな原神のボスは？」" }, // 20
        { name: "ゴール（メロピデ要塞）", x: 65, y: 50, event: "ゴール！おめでとう！", goal: true } // 21
        // ... 他のマスも同様に追加
    ];

    // ゲーム開始処理
    startGameButton.addEventListener('click', () => {
        numPlayers = parseInt(numPlayersInput.value);
        if (numPlayers < 1 || numPlayers > 4) {
            alert("プレイヤー人数は1人から4人で設定してください。");
            return;
        }
        initializeGame();
        document.querySelector('.player-setup').style.display = 'none'; // 設定を非表示
        rollDiceButton.disabled = false;
    });

    function initializeGame() {
        currentPlayer = 1;
        playerPositions = Array(numPlayers).fill(0); // 全員スタートマス
        playerPieces.forEach(piece => piece.remove()); // 既存のコマを削除
        playerPieces = [];

        for (let i = 0; i < numPlayers; i++) {
            const piece = document.createElement('div');
            piece.classList.add('player-piece', `player-${i + 1}`);
            gameBoardContainer.appendChild(piece);
            playerPieces.push(piece);
            updatePlayerPiecePosition(i);
        }
        updateGameInfo();
        eventMessageDisplay.textContent = "ゲーム開始！プレイヤー1の番です。";
    }

    // サイコロを振る処理
    rollDiceButton.addEventListener('click', () => {
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        diceResultDisplay.textContent = diceRoll;

        movePlayer(diceRoll);
    });

    // プレイヤーを移動させる処理
    function movePlayer(steps) {
        let currentPositionIndex = playerPositions[currentPlayer - 1];
        let newPositionIndex = currentPositionIndex + steps;

        // ゴール判定
        if (newPositionIndex >= squares.length - 1) {
            newPositionIndex = squares.length - 1; // ゴールマスに設定
            playerPositions[currentPlayer - 1] = newPositionIndex;
            updatePlayerPiecePosition(currentPlayer - 1);
            updateGameInfo();
            eventMessageDisplay.textContent = `プレイヤー${currentPlayer}が${squares[newPositionIndex].name}に到着！ ${squares[newPositionIndex].event}`;
            rollDiceButton.disabled = true; // ゲーム終了
            alert(`プレイヤー${currentPlayer}の勝利です！おめでとうございます！`);
            // ここでゲーム終了後の処理（例：リセットボタン表示など）を追加できます
            return;
        }

        playerPositions[currentPlayer - 1] = newPositionIndex;
        updatePlayerPiecePosition(currentPlayer - 1);
        handleSquareEvent(newPositionIndex);
        updateGameInfo();

        // 次のプレイヤーへ
        currentPlayer = (currentPlayer % numPlayers) + 1;
        updateGameInfo(); // 次のプレイヤー情報を更新
        eventMessageDisplay.textContent += ` 次はプレイヤー${currentPlayer}の番です。`;
    }

    // マスのイベント処理
    function handleSquareEvent(squareIndex) {
        const square = squares[squareIndex];
        eventMessageDisplay.textContent = `プレイヤー${currentPlayer}が${square.name}に止まりました。 ${square.event || ''}`;

        if (square.special === "conditional_move") {
            // ここで条件分岐のロジックを実装します。
            // 例：「現在のキャラで通常攻撃を一発振り、会心だったら3マス進む」
            // この例では簡略化のため、confirmダイアログで会心かどうかをユーザーに尋ねます。
            // 実際のゲームでは、より複雑な条件判定が必要になる場合があります。
            const criticalHit = confirm("会心が出ましたか？ (OK = はい / キャンセル = いいえ)");
            if (criticalHit) {
                eventMessageDisplay.textContent += ` 会心が出た！${square.condition_value}マス進みます。`;
                // 重要：この進む処理は、現在のmovePlayerのフローとは別で考慮する必要がある
                // 今回は単純に現在のプレイヤーの位置を更新し、再度イベントをチェックする
                let currentPositionIndex = playerPositions[currentPlayer - 1];
                let newPositionIndex = currentPositionIndex + square.condition_value;

                if (newPositionIndex >= squares.length - 1) {
                    newPositionIndex = squares.length - 1;
                }
                playerPositions[currentPlayer - 1] = newPositionIndex;
                updatePlayerPiecePosition(currentPlayer - 1);
                handleSquareEvent(newPositionIndex); // 移動先のイベントを再度処理
            } else {
                eventMessageDisplay.textContent += " 会心は出ませんでした。";
            }
        }
        // 他の特殊イベントもここに追加
    }

    // プレイヤーのコマの位置を更新
    function updatePlayerPiecePosition(playerIndex) {
        const squareIndex = playerPositions[playerIndex];
        const square = squares[squareIndex];
        const piece = playerPieces[playerIndex];

        if (square && piece) {
            // 盤面画像の実際の表示サイズを取得
            const boardRect = boardImage.getBoundingClientRect();
            const boardDisplayWidth = boardRect.width;
            const boardDisplayHeight = boardRect.height;

            // 画像の元々のサイズ (CSSで指定している場合や、img要素のnaturalWidthなどから取得)
            // ここでは簡略化のため、CSSで指定した幅を基準にするか、
            // もしくは画像が読み込まれた後に naturalWidth, naturalHeight を使うのが確実です。
            // 今回はCSSの .game-board-container の幅を基準にします。
            const containerWidth = gameBoardContainer.offsetWidth;


            // 割合で位置を計算
            // 少しオフセットを加えることで、コマがマスの中心に来るように調整
            const offsetX = - (piece.offsetWidth / 2); // コマの幅の半分
            const offsetY = - (piece.offsetHeight / 2); // コマの高さの半分

            // 画像の表示サイズに対する割合で計算
            piece.style.left = `calc(${square.x}% - ${piece.offsetWidth / 2}px)`;
            piece.style.top = `calc(${square.y}% - ${piece.offsetHeight / 2}px)`;


            // 複数のコマが同じマスにいる場合のオフセット（簡易版）
            // 同じマスにいる他のプレイヤーを探し、少しずらして表示
            let offsetMagnitude = 5; // ずらす量（ピクセル）
            let overlapCount = 0;
            for (let i = 0; i < numPlayers; i++) {
                if (i !== playerIndex && playerPositions[i] === squareIndex) {
                    overlapCount++;
                    // 簡単な例として、プレイヤー番号によって少し位置をずらす
                    // より洗練された方法としては、円形に配置するなどがあります
                    switch(playerIndex % 4) {
                        case 0: piece.style.transform = `translate(${offsetMagnitude * overlapCount}px, ${offsetMagnitude * overlapCount}px)`; break;
                        case 1: piece.style.transform = `translate(-${offsetMagnitude * overlapCount}px, ${offsetMagnitude * overlapCount}px)`; break;
                        case 2: piece.style.transform = `translate(${offsetMagnitude * overlapCount}px, -${offsetMagnitude * overlapCount}px)`; break;
                        case 3: piece.style.transform = `translate(-${offsetMagnitude * overlapCount}px, -${offsetMagnitude * overlapCount}px)`; break;
                    }
                }
            }
            if (overlapCount === 0) {
                 piece.style.transform = 'translate(0,0)'; // 重なりがなければリセット
            }

        }
    }


    // ゲーム情報を更新
    function updateGameInfo() {
        currentPlayerDisplay.textContent = currentPlayer;
        if (playerPositions[currentPlayer - 1] !== undefined && squares[playerPositions[currentPlayer - 1]]) {
            currentPositionDisplay.textContent = squares[playerPositions[currentPlayer - 1]].name;
        } else if (playerPositions[currentPlayer-1] === 0) {
            currentPositionDisplay.textContent = squares[0].name;
        }
    }

    // 初期状態ではサイコロボタンを無効化
    rollDiceButton.disabled = true;
});
