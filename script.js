document.addEventListener('DOMContentLoaded', () => {
    const boardImage = document.getElementById('game-board-img');
    const gameBoardContainer = document.querySelector('.game-board-container');
    const rollDiceButton = document.getElementById('roll-dice-button');
    const diceResultDisplay = document.getElementById('dice-result');
    const currentPlayerDisplay = document.getElementById('current-player');
    const eventMessageDisplay = document.getElementById('event-message');
    const numPlayersInput = document.getElementById('num-players');
    const startGameButton = document.getElementById('start-game-button');

    let numPlayers = 1;
    let currentPlayer = 1;
    let evented = 0
    let playerPositions = []; // 各プレイヤーの現在のマス番号
    let playerPieces = []; // 各プレイヤーのコマのDOM要素

    // すごろくのマス定義 (座標とイベント)
    // 注意: 各マスの座標 (x, y) は、画像に合わせて手動で調整する必要があります。
    // x は左からの割合 (0% - 100%)、 y は上からの割合 (0% - 100%)
    const squares = [
        { name: "スタート（星落としの湖）", x: 9, y: 15, event: "ストーリー進捗、良く使う編成を教えて！" }, // 0
        { name: "モンド城", x: 9.8, y: 52, event: "一番好きな原神の国は？" }, // 1
        { name: "風立ちの地", x: 10, y: 85, event: "好きな原神のマップ・景色は？" }, // 2
        { name: "璃月港", x: 26.6, y: 85, event: "一番最初に引いた限定星5キャラは？" }, // 3
        { name: "層岩巨淵", x: 44.3, y: 85, event: "次に育てたいキャラは？" }, // 4
        { name: "翹英荘", x: 61.5, y: 85, event: "一番使っているキャラは？" }, // 5
        { name: "望舒旅館", x: 80, y: 85, event: "あなたの推しについて教えて！" }, // 6
        { name: "稲妻城", x: 93, y: 85, event: "好きor嫌いな原神のボスは？"}, // 7
        { name: "鳴神大社", x: 93, y: 53, event: "好きな爆発のカットインは？" }, // 8
        { name: "海祇島", x: 93, y: 33.3, event: "次に引きたいキャラは？" }, // 9
        { name: "浅瀬神社", x: 81.3, y: 13, event: "よく回っている聖遺物秘境は？" }, // 10
        { name: "スメールシティ", x: 65.5, y: 13, event: "一番好きなイベントは？" }, // 11
        { name: "アアル村", x: 50, y: 13, event: "好きな魔神・伝説任務は？" }, // 12
        { name: "ウェネトトンネル", x: 35.4, y: 13, event: "現在のキャラで通常攻撃を一発振り、会心だったら3マス進む" , special: "conditional_move", condition_value: 3 }, // 13
        { name: "ロマリタイムハーバー", x: 26, y: 35.2, event: "原神を始めたきっかけは？」" }, // 14
        { name: "フォンテーヌ廷", x: 26, y: 63.9, event: "今までで一番の神引きは？" }, // 15
        { name: "ペトリコール", x: 43, y: 63.9, event: "他にハマっているゲームは？" }, // 16
        { name: "こだまの子", x: 43, y: 37, event: "限定キャラが一体貰えるなら誰が欲しい？" }, // 17
        { name: "流泉の衆", x: 60, y: 37, event: "自慢の聖遺物があれば見せてください！" }, // 18
        { name: "懸木の民", x: 60, y: 63.9, event: "神の目が貰えるなら何元素がいい？" }, // 19
        { name: "ゴール（メロピデ要塞）", x: 80.7, y: 57.4, event: "ゴール！おめでとう！", goal: true } // 20
        // ... 他のマスも同様に追加
    ];

    // ゲーム開始処理
    startGameButton.addEventListener('click', () => {
        numPlayers = parseInt(numPlayersInput.value);
        if (numPlayers > 4) {
            numPlayers = 4;
        }
        if (numPlayers < 1) {
            numPlayers = 1;
        }

        playerNames = []; // プレイヤー名を初期化
        for (let i = 1; i <= numPlayers; i++) {
            const nameInput = document.getElementById(`player-${i}-name`);
            if (nameInput) {
                playerNames.push(nameInput.value || `プレイヤー${i}`); // 名前が入力されていなければデフォルト名を使用
            } else {
                playerNames.push(`プレイヤー${i}`);
            }
        }

        initializeGame();
        document.querySelector('.player-setup').style.display = 'none';
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
       eventMessageDisplay.textContent = `まずは全員、ストーリー進捗・よく使う編成を教えて！`;
    }

    // サイコロを振る処理
    rollDiceButton.addEventListener('click', () => {
        const diceRoll = Math.floor(Math.random() * 9) + 1;
        diceResultDisplay.textContent = diceRoll;
        evented = 0;
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
            eventMessageDisplay.textContent = `プレイヤー${currentPlayer}が${squares[newPositionIndex].name}に到着！${squares[newPositionIndex].event}`;
            rollDiceButton.disabled = true; // ゲーム終了
            alert(`プレイヤー${currentPlayer}の勝利です！おめでとうございます！`);
            // ここでゲーム終了後の処理（例：リセットボタン表示など）を追加できます
            return;
        }

        playerPositions[currentPlayer - 1] = newPositionIndex;
        updatePlayerPiecePosition(currentPlayer - 1);
        updateGameInfo();
       handleSquareEvent(newPositionIndex);
        // 次のプレイヤーへ
        currentPlayer = (currentPlayer % numPlayers) + 1;
        updateGameInfo(); // 次のプレイヤー情報を更新
    }

// マスのイベント処理
    function handleSquareEvent(squareIndex) {
        const square = squares[squareIndex];
        eventMessageDisplay.textContent = `プレイヤー${currentPlayer} (${playerNames[currentPlayer - 1]}) が${square.name}に止まりました。 \n 「${square.event || ''}」`;

        const overlappingPlayerIndex = playerPositions.findIndex((pos, index) => index !== currentPlayer - 1 && pos === squareIndex);
        if (square.special === "conditional_move") {
            evented = 1;
            // (conditional_move の処理はそのまま)
            const criticalHit = confirm("ウェネトトンネル！会心が出ましたか？ (OK = はい / キャンセル = いいえ)");
            if (criticalHit) {
                eventMessageDisplay.textContent += ` 会心が出た！${square.condition_value}マス進みます。`;
                let currentPositionIndex = playerPositions[currentPlayer - 1];
                let newPositionIndex = Math.min(currentPositionIndex + square.condition_value, squares.length - 1);
                playerPositions[currentPlayer - 1] = newPositionIndex;
                updatePlayerPiecePosition(currentPlayer - 1);
                handleSquareEvent(newPositionIndex); // ←★ ここを追加 ★
            } else {
                eventMessageDisplay.textContent += " 会心は出ませんでした。";
            }
        }
        if (overlappingPlayerIndex !== -1 && evented == 0) {
            evented = 1;
            const messages = [
                "純水精霊",
                "エンシェントヴィシャップ",
                "無相の氷",
                "魔偶剣鬼",
                "無相の炎",
                "恒常からくり陣形",
                "無相の水",
                "雷音権現",
                "黄金王獣",
                "アビサルヴィシャップの群れ",
                "遺跡サーペント",
                "迅電樹",
                "マッシュラプトル",
                "兆載永劫ドレイク",
                "半永久統制マトリックス",
                "無相の草",
                "風蝕ウェネト",
                "深罪の浸礼者",
                "氷風組曲・コッペリア",
                "氷風組曲・コぺリウス",
                "鉄甲熔炎帝王",
                "実験用フィールド生成装置",
                "千年真珠の海駿",
                "水形タルパ",
                "山隠れの猊獣",
                "魔像レガトゥス",
                "ホワライガ・ンゴウボウ",
                "貪食のユムカ竜",
                "秘源機兵・機巧デバイス",
                "深遠なるミミックパピラ",
                "迷える霊覚の修験者",
                "輝ける溶岩の龍像",
                "秘源機兵・統御デバイス"
            ];
            const currentPlayerNextPos = playerPositions[currentPlayer - 1] + 2;
            const overlappingPlayerNextPos = playerPositions[overlappingPlayerIndex] + 2;
            const goalIndex = squares.length - 1;
            if (currentPlayerNextPos < goalIndex && overlappingPlayerNextPos < goalIndex && playerPositions[currentPlayer - 1] != 0 && playerPositions[overlappingPlayerIndex] != 0) {
                // 二人ともゴールから2マス以内でなければ
                const randomMessage = `${playerNames[overlappingPlayerIndex]}と遭遇！全員で` + messages[Math.floor(Math.random() * messages.length)] + "を倒してこよう！";

                const confirmResult = confirm(`${randomMessage}\nOK:勝利！（2マス進む）\nキャンセル:何も起こらない`);
                if (confirmResult) {
                    playerPositions[currentPlayer - 1] = currentPlayerNextPos;
                    updatePlayerPiecePosition(currentPlayer - 1);
                    handleSquareEvent(currentPlayerNextPos); // 移動先のイベントを処理

                    playerPositions[overlappingPlayerIndex] = overlappingPlayerNextPos;
                    updatePlayerPiecePosition(overlappingPlayerIndex);

                    eventMessageDisplay.textContent += `\n ${playerNames[currentPlayer - 1]}と${playerNames[overlappingPlayerIndex]}が2マス進みました。`;
                } else {
                    // キャンセルなら何も起こらない
                    eventMessageDisplay.textContent += "\n何も起こりませんでした。";
                }
            }
            else {
                eventMessageDisplay.textContent += "\n遭遇しましたが、ゴール手前のため何も起こりません。";
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

    // ゲーム情報を更新
    function updateGameInfo() {
        currentPlayerDisplay.textContent = `${playerNames[currentPlayer - 1]} (${currentPlayer})`;
    }

    // 初期状態ではサイコロボタンを無効化
    rollDiceButton.disabled = true;
});
