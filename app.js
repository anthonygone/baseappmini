/* =========================================================
   FUNKO QUEST
   Base Mainnet Game
   ========================================================= */

const CONFIG = {
  chainId: "0x2105",
  chainIdDecimal: 8453,

  contract:
    "0x859cb50827bdaf5d980dc8ff79e5cd82094e9296",

  builderCode: "bc_z2bsqs1j",

  rpc:
    "https://mainnet.base.org",

  explorer:
    "https://base.blockscout.com/tx/",

  contractExplorer:
    "https://base.blockscout.com/address/0x859cb50827bdaf5d980dc8ff79e5cd82094e9296"
};


/* =========================================================
   FUNKO COLLECTION
   ========================================================= */

const FUNKOS = [
  {
    id: 0,
    name: "Base Bot",
    emoji: "🤖",
    rarity: "Common",
    description: "The first Funko from the Base world."
  },
  {
    id: 1,
    name: "Moon Alien",
    emoji: "👽",
    rarity: "Common",
    description: "A visitor from the Base moon."
  },
  {
    id: 2,
    name: "Crypto Wizard",
    emoji: "🧙",
    rarity: "Rare",
    description: "A wizard who understands onchain magic."
  },
  {
    id: 3,
    name: "Base Ninja",
    emoji: "🥷",
    rarity: "Rare",
    description: "Fast, silent and always on Base."
  },
  {
    id: 4,
    name: "Chain King",
    emoji: "👑",
    rarity: "Epic",
    description: "The king of the Funko chain."
  },
  {
    id: 5,
    name: "Legendary Unicorn",
    emoji: "🦄",
    rarity: "Legendary",
    description: "The rarest Funko in the collection."
  }
];


/* =========================================================
   GAME STATE
   ========================================================= */

const STORAGE_KEY = "funkoQuestState";

let state = {
  level: 1,
  xp: 0,
  coins: 0,
  streak: 0,
  score: 0,
  collection: [],
  dailyClaimed: null,
  lastGame: null,
  wallet: null
};

let gameRunning = false;
let gameScore = 0;
let gameTime = 30;
let gameTimer = null;


/* =========================================================
   LOAD / SAVE
   ========================================================= */

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      state = {
        ...state,
        ...parsed
      };
    }
  } catch (error) {
    console.error("Could not load game state:", error);
  }
}


function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch (error) {
    console.error("Could not save game state:", error);
  }
}


/* =========================================================
   LEVEL SYSTEM
   ========================================================= */

function xpNeeded() {
  return state.level * 100;
}


function addXP(amount) {
  state.xp += amount;

  let leveledUp = false;

  while (state.xp >= xpNeeded()) {
    state.xp -= xpNeeded();
    state.level++;
    leveledUp = true;
  }

  if (leveledUp) {
    showModal(
      "🎉",
      "Level Up!",
      `You reached Level ${state.level}!`
    );
  }

  saveState();
}


/* =========================================================
   UI
   ========================================================= */

function buildGameUI() {

  document.body.innerHTML = `
    <div id="funko-app">

      <header class="topbar">
        <div class="brand">
          <div class="brand-icon">🎁</div>

          <div>
            <div class="brand-title">FUNKO QUEST</div>
            <div class="brand-subtitle">
              Play. Collect. Level Up.
            </div>
          </div>
        </div>

        <button
          id="reset-game"
          class="icon-button"
          title="Reset local game"
        >
          ↻
        </button>
      </header>


      <main class="container">

        <!-- PLAYER -->
        <section class="card player-card">

          <div class="player-level">
            <span class="label">LEVEL</span>
            <strong id="level">1</strong>
          </div>

          <div class="xp-area">

            <div class="xp-top">
              <span class="label">XP</span>
              <span id="xp-text">0 / 100</span>
            </div>

            <div class="xp-bar">
              <div
                id="xp-fill"
                class="xp-fill"
              ></div>
            </div>

          </div>

          <div class="coins">
            <div class="coin-icon">🪙</div>
            <strong id="coins">0</strong>
          </div>

        </section>


        <!-- DAILY -->
        <section class="card">

          <div class="section-label">
            DAILY STREAK
          </div>

          <div class="daily-row">

            <div class="streak">
              🔥
              <strong id="streak">0</strong>
              Days
            </div>

            <button
              id="daily-button"
              class="button secondary"
            >
              Claim Daily
            </button>

          </div>

        </section>


        <!-- GAME -->
        <section class="card game-card">

          <div class="game-heading">

            <div>
              <div class="section-label">
                QUICK GAME
              </div>

              <h2>🎯 Funko Tap</h2>

              <p>
                Tap the Funko as fast as you can
                before time runs out!
              </p>
            </div>

            <div class="game-stats">

              <div>
                Score:
                <strong id="game-score">0</strong>
              </div>

              <div>
                ⏱
                <span id="game-time">30</span>s
              </div>

            </div>

          </div>


          <div
            id="game-board"
            class="game-board"
          >
            <div class="ready-message">
              Ready to play?
            </div>
          </div>


          <button
            id="start-game"
            class="button primary big-button"
          >
            ▶ Start Game
          </button>

        </section>


        <!-- MYSTERY BOX -->
        <section class="card mystery-card">

          <div>

            <div class="section-label">
              DAILY DROP
            </div>

            <h2>🎁 Mystery Box</h2>

            <p>
              Open a box and discover a collectible.
            </p>

          </div>

          <button
            id="mystery-button"
            class="button gold"
          >
            Open Box
          </button>

        </section>


        <!-- COLLECTION -->
        <section class="card">

          <div class="collection-header">

            <div>

              <div class="section-label">
                YOUR COLLECTION
              </div>

              <h2>🧸 Funkos</h2>

            </div>

            <div id="collection-count">
              0 / 6 collected
            </div>

          </div>

          <div
            id="collection"
            class="collection"
          ></div>

        </section>


        <!-- BASE -->
        <section class="card base-card">

          <div>

            <div class="section-label">
              BASE MAINNET
            </div>

            <h2>
              🔵 Base Wallet
            </h2>

            <p id="wallet-status">
              Connect your wallet to claim your Funko.
            </p>

          </div>

          <button
            id="wallet-button"
            class="button secondary"
          >
            Connect Wallet
          </button>

        </section>


        <!-- CLAIM -->
        <section
          id="claim-section"
          class="card claim-card"
        >

          <div>

            <div class="section-label">
              ONCHAIN REWARD
            </div>

            <h2>
              🏆 Claim Funko
            </h2>

            <p id="claim-description">
              Play the game, then claim your Funko
              directly on Base Mainnet.
            </p>

          </div>

          <button
            id="claim-button"
            class="button primary"
          >
            Claim Funko
          </button>

        </section>


        <div class="builder">
          Builder Code:
          <strong>${CONFIG.builderCode}</strong>
        </div>

      </main>


      <!-- MODAL -->
      <div
        id="modal"
        class="modal hidden"
      >

        <div class="modal-box">

          <button
            id="modal-close"
            class="modal-close"
          >
            ×
          </button>

          <div
            id="modal-icon"
            class="modal-icon"
          >
            🎉
          </div>

          <h2 id="modal-title">
            Success
          </h2>

          <p id="modal-message">
            Done!
          </p>

          <button
            id="modal-ok"
            class="button primary"
          >
            Awesome!
          </button>

        </div>

      </div>

    </div>
  `;


  injectStyles();

  bindEvents();

  render();

  updateWalletUI();
}


/* =========================================================
   STYLES
   ========================================================= */

function injectStyles() {

  const style = document.createElement("style");

  style.textContent = `

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background:
        radial-gradient(
          circle at top,
          #101a35 0,
          #090909 45%,
          #050505 100%
        );
      color: white;
      font-family:
        Inter,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
      min-height: 100vh;
    }

    button {
      font: inherit;
    }

    .topbar {
      max-width: 600px;
      margin: 0 auto;
      padding: 22px 18px 12px;

      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;

      display: grid;
      place-items: center;

      background: #075fff;
      font-size: 25px;
      box-shadow:
        0 0 25px rgba(0, 100, 255, .25);
    }

    .brand-title {
      font-weight: 900;
      letter-spacing: .4px;
      font-size: 17px;
    }

    .brand-subtitle {
      color: #a5a5a5;
      font-size: 12px;
      margin-top: 2px;
    }

    .icon-button {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: 1px solid #282828;
      background: #151515;
      color: white;
      cursor: pointer;
      font-size: 22px;
    }

    .container {
      width: min(600px, calc(100% - 24px));
      margin: 0 auto;
      padding-bottom: 40px;
    }

    .card {
      background:
        linear-gradient(
          145deg,
          rgba(31,31,31,.98),
          rgba(22,22,22,.98)
        );

      border: 1px solid #292929;
      border-radius: 20px;
      padding: 18px;
      margin-bottom: 14px;

      box-shadow:
        0 12px 35px rgba(0,0,0,.18);
    }

    .player-card {
      display: grid;
      grid-template-columns: 60px 1fr 55px;
      gap: 15px;
      align-items: center;
    }

    .label,
    .section-label {
      color: #a9a9a9;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .player-level strong {
      display: block;
      color: #4f87ff;
      font-size: 28px;
      line-height: 1.1;
      margin-top: 4px;
    }

    .xp-top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 7px;
      color: #aaa;
      font-size: 11px;
    }

    .xp-bar {
      height: 9px;
      background: #080808;
      border-radius: 10px;
      overflow: hidden;
    }

    .xp-fill {
      height: 100%;
      width: 0%;
      background: #075fff;
      transition: width .35s ease;
    }

    .coins {
      text-align: center;
    }

    .coin-icon {
      font-size: 19px;
    }

    .coins strong {
      display: block;
      margin-top: 2px;
      font-size: 18px;
    }

    .daily-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }

    .streak {
      font-size: 18px;
    }

    .game-heading {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    h2 {
      margin: 5px 0;
      font-size: 19px;
    }

    p {
      color: #999;
      font-size: 12px;
      line-height: 1.5;
      margin: 5px 0 0;
    }

    .game-stats {
      color: #aaa;
      font-size: 11px;
      text-align: right;
      white-space: nowrap;
    }

    .game-stats div + div {
      margin-top: 5px;
    }

    .game-board {
      position: relative;
      height: 255px;
      margin-top: 16px;

      border:
        1px dashed #303030;

      border-radius: 16px;

      overflow: hidden;

      background:
        radial-gradient(
          circle,
          rgba(16,49,116,.25),
          rgba(5,5,5,.7)
        );
    }

    .ready-message {
      position: absolute;
      inset: 0;

      display: grid;
      place-items: center;

      color: #aaa;
      font-weight: 700;
    }

    .funko-target {
      position: absolute;

      width: 75px;
      height: 75px;

      border: 0;
      border-radius: 50%;

      display: grid;
      place-items: center;

      background: #0b55e8;

      cursor: pointer;

      font-size: 40px;

      box-shadow:
        0 0 35px rgba(0,90,255,.45);

      animation: pulse .65s infinite alternate;
    }

    @keyframes pulse {
      from {
        transform: scale(.94);
      }

      to {
        transform: scale(1.06);
      }
    }

    .button {
      border: 0;
      border-radius: 13px;
      padding: 12px 17px;
      color: white;
      font-weight: 800;
      cursor: pointer;
      transition: transform .12s ease, opacity .12s ease;
    }

    .button:hover {
      transform: translateY(-1px);
    }

    .button:disabled {
      opacity: .45;
      cursor: not-allowed;
      transform: none;
    }

    .primary {
      background: #075fff;
    }

    .secondary {
      background: #272727;
      border: 1px solid #3a3a3a;
    }

    .gold {
      background: #f4c400;
      color: #111;
    }

    .big-button {
      width: 100%;
      margin-top: 12px;
      font-size: 15px;
    }

    .mystery-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .collection-header {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 10px;
    }

    #collection-count {
      color: #888;
      font-size: 11px;
    }

    .collection {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 9px;
      margin-top: 13px;
    }

    .collectible {
      min-height: 115px;
      border: 1px solid #2c2c2c;
      border-radius: 14px;
      background: #191919;
      padding: 10px;
      text-align: center;
    }

    .collectible.locked {
      opacity: .4;
    }

    .collectible-emoji {
      font-size: 35px;
      margin: 4px 0;
    }

    .collectible-name {
      font-size: 11px;
      font-weight: 800;
    }

    .collectible-rarity {
      font-size: 9px;
      color: #888;
      margin-top: 4px;
    }

    .base-card,
    .claim-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
    }

    .wallet-address {
      color: #6d9cff;
      font-family: monospace;
      font-size: 11px;
      margin-top: 5px;
    }

    .builder {
      text-align: center;
      color: #777;
      font-size: 10px;
      padding: 8px;
    }

    .builder strong {
      color: #5790ff;
    }

    .modal {
      position: fixed;
      inset: 0;

      background: rgba(0,0,0,.78);

      display: grid;
      place-items: center;

      padding: 20px;

      z-index: 9999;
    }

    .modal.hidden {
      display: none;
    }

    .modal-box {
      width: min(380px, 100%);

      position: relative;

      background: #202020;
      border: 1px solid #353535;
      border-radius: 22px;

      padding: 30px 22px 22px;

      text-align: center;
    }

    .modal-close {
      position: absolute;
      right: 15px;
      top: 12px;

      border: 0;
      background: transparent;
      color: #aaa;

      font-size: 25px;
      cursor: pointer;
    }

    .modal-icon {
      font-size: 50px;
      margin-bottom: 8px;
    }

    .modal-box h2 {
      font-size: 22px;
    }

    .modal-box p {
      margin: 10px 0 18px;
    }

    @media (max-width: 480px) {

      .player-card {
        grid-template-columns: 50px 1fr 45px;
      }

      .base-card,
      .claim-card,
      .mystery-card {
        align-items: flex-start;
      }

      .base-card,
      .claim-card {
        flex-direction: column;
      }

      .base-card .button,
      .claim-card .button {
        width: 100%;
      }

      .collection {
        gap: 7px;
      }
    }

  `;

  document.head.appendChild(style);
}


/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents() {

  document
    .getElementById("wallet-button")
    .addEventListener(
      "click",
      connectWallet
    );

  document
    .getElementById("claim-button")
    .addEventListener(
      "click",
      claimFunko
    );

  document
    .getElementById("daily-button")
    .addEventListener(
      "click",
      claimDaily
    );

  document
    .getElementById("mystery-button")
    .addEventListener(
      "click",
      openMysteryBox
    );

  document
    .getElementById("start-game")
    .addEventListener(
      "click",
      startGame
    );

  document
    .getElementById("reset-game")
    .addEventListener(
      "click",
      resetLocalGame
    );

  document
    .getElementById("modal-close")
    .addEventListener(
      "click",
      closeModal
    );

  document
    .getElementById("modal-ok")
    .addEventListener(
      "click",
      closeModal
    );
}


/* =========================================================
   RENDER
   ========================================================= */

function render() {

  const levelEl =
    document.getElementById("level");

  if (!levelEl) return;

  levelEl.textContent =
    state.level;

  document.getElementById("coins").textContent =
    state.coins;

  document.getElementById("streak").textContent =
    state.streak;

  const needed = xpNeeded();

  document.getElementById("xp-text").textContent =
    `${state.xp} / ${needed}`;

  document.getElementById("xp-fill").style.width =
    `${Math.min(
      100,
      (state.xp / needed) * 100
    )}%`;

  document.getElementById("game-score").textContent =
    gameScore;

  renderCollection();

  renderDaily();

  renderClaimButton();
}


/* =========================================================
   COLLECTION
   ========================================================= */

function renderCollection() {

  const container =
    document.getElementById("collection");

  if (!container) return;

  container.innerHTML = "";

  FUNKOS.forEach((funko) => {

    const owned =
      state.collection.includes(
        funko.id
      );

    const item =
      document.createElement("div");

    item.className =
      `collectible ${
        owned ? "" : "locked"
      }`;

    item.innerHTML = owned
      ? `
        <div class="collectible-emoji">
          ${funko.emoji}
        </div>

        <div class="collectible-name">
          ${funko.name}
        </div>

        <div class="collectible-rarity">
          ${funko.rarity}
        </div>
      `
      : `
        <div class="collectible-emoji">
          🔒
        </div>

        <div class="collectible-name">
          Unknown
        </div>

        <div class="collectible-rarity">
          LOCKED
        </div>
      `;

    container.appendChild(item);
  });

  document.getElementById(
    "collection-count"
  ).textContent =
    `${state.collection.length} / ${FUNKOS.length} collected`;
}


/* =========================================================
   DAILY
   ========================================================= */

function todayKey() {

  const d = new Date();

  return [
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate()
  ].join("-");
}


function renderDaily() {

  const button =
    document.getElementById(
      "daily-button"
    );

  if (!button) return;

  if (state.dailyClaimed === todayKey()) {

    button.disabled = true;

    button.textContent =
      "Claimed ✓";

  } else {

    button.disabled = false;

    button.textContent =
      "Claim Daily";
  }
}


function claimDaily() {

  if (
    state.dailyClaimed ===
    todayKey()
  ) {
    return;
  }

  state.dailyClaimed =
    todayKey();

  state.streak++;

  state.coins += 25;

  addXP(25);

  saveState();

  render();

  showModal(
    "🔥",
    "Daily Reward!",
    "+25 coins and +25 XP"
  );
}


/* =========================================================
   MYSTERY BOX
   ========================================================= */

function openMysteryBox() {

  const available =
    FUNKOS.filter(
      (funko) =>
        !state.collection.includes(
          funko.id
        )
    );

  if (!available.length) {

    showModal(
      "🏆",
      "Collection Complete!",
      "You already collected every Funko."
    );

    return;
  }

  const random =
    available[
      Math.floor(
        Math.random() *
        available.length
      )
    ];

  state.collection.push(
    random.id
  );

  state.coins += 50;

  addXP(50);

  saveState();

  render();

  showModal(
    random.emoji,
    "Mystery Box!",
    `You discovered ${random.name}!`
  );
}


/* =========================================================
   FUNKO TAP GAME
   ========================================================= */

function startGame() {

  if (gameRunning) return;

  gameRunning = true;

  gameScore = 0;

  gameTime = 30;

  const button =
    document.getElementById(
      "start-game"
    );

  button.disabled = true;

  button.textContent =
    "Game Running...";

  document.getElementById(
    "game-score"
  ).textContent = "0";

  document.getElementById(
    "game-time"
  ).textContent = "30";

  spawnFunko();

  clearInterval(gameTimer);

  gameTimer =
    setInterval(() => {

      gameTime--;

      document.getElementById(
        "game-time"
      ).textContent =
        gameTime;

      if (gameTime <= 0) {
        endGame();
      }

    }, 1000);
}


function spawnFunko() {

  if (!gameRunning) return;

  const board =
    document.getElementById(
      "game-board"
    );

  board.innerHTML = "";

  const target =
    document.createElement("button");

  target.className =
    "funko-target";

  const randomFunko =
    FUNKOS[
      Math.floor(
        Math.random() *
        FUNKOS.length
      )
    ];

  target.textContent =
    randomFunko.emoji;

  const maxX =
    Math.max(
      5,
      board.clientWidth - 90
    );

  const maxY =
    Math.max(
      5,
      board.clientHeight - 90
    );

  target.style.left =
    `${Math.random() * maxX}px`;

  target.style.top =
    `${Math.random() * maxY}px`;

  target.addEventListener(
    "click",
    () => {

      if (!gameRunning) return;

      gameScore++;

      state.score++;

      state.coins += 1;

      addXP(2);

      document.getElementById(
        "game-score"
      ).textContent =
        gameScore;

      spawnFunko();
    }
  );

  board.appendChild(target);
}


function endGame() {

  clearInterval(gameTimer);

  gameRunning = false;

  state.coins +=
    gameScore * 2;

  addXP(
    gameScore * 3
  );

  state.lastGame =
    new Date().toISOString();

  saveState();

  const board =
    document.getElementById(
      "game-board"
    );

  board.innerHTML = `
    <div class="ready-message">
      🎯 Game Over — Score: ${gameScore}
    </div>
  `;

  const button =
    document.getElementById(
      "start-game"
    );

  button.disabled = false;

  button.textContent =
    "▶ Play Again";

  render();

  showModal(
    "🎯",
    "Game Complete!",
    `You scored ${gameScore} taps and earned rewards.`
  );
}


/* =========================================================
   WALLET
   ========================================================= */

async function connectWallet() {

  if (!window.ethereum) {

    showModal(
      "🔗",
      "Wallet Not Found",
      "Please open Funko Quest in a Web3 wallet/browser."
    );

    return;
  }

  try {

    const accounts =
      await window.ethereum.request({
        method:
          "eth_requestAccounts"
      });

    if (!accounts.length) {
      return;
    }

    await ensureBaseMainnet();

    state.wallet =
      accounts[0];

    saveState();

    updateWalletUI();

    await refreshClaimStatus();

  } catch (error) {

    console.error(
      "Wallet connection failed:",
      error
    );

    showModal(
      "⚠️",
      "Wallet Connection Failed",
      getErrorMessage(error)
    );
  }
}


/* =========================================================
   BASE MAINNET
   ========================================================= */

async function ensureBaseMainnet() {

  const currentChain =
    await window.ethereum.request({
      method: "eth_chainId"
    });

  if (
    currentChain.toLowerCase() ===
    CONFIG.chainId
  ) {
    return;
  }

  try {

    await window.ethereum.request({
      method:
        "wallet_switchEthereumChain",
      params: [
        {
          chainId:
            CONFIG.chainId
        }
      ]
    });

  } catch (error) {

    if (
      error.code === 4902
    ) {

      await window.ethereum.request({
        method:
          "wallet_addEthereumChain",
        params: [
          {
            chainId:
              CONFIG.chainId,

            chainName:
              "Base",

            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18
            },

            rpcUrls: [
              CONFIG.rpc
            ],

            blockExplorerUrls: [
              "https://base.blockscout.com/"
            ]
          }
        ]
      });

    } else {
      throw error;
    }
  }
}


/* =========================================================
   WALLET UI
   ========================================================= */

function updateWalletUI() {

  const button =
    document.getElementById(
      "wallet-button"
    );

  const status =
    document.getElementById(
      "wallet-status"
    );

  if (!button || !status) return;

  if (state.wallet) {

    const short =
      `${state.wallet.slice(0, 6)}...${state.wallet.slice(-4)}`;

    button.textContent =
      "Connected ✓";

    status.innerHTML = `
      Connected to Base Mainnet
      <div class="wallet-address">
        ${short}
      </div>
    `;

  } else {

    button.textContent =
      "Connect Wallet";

    status.textContent =
      "Connect your wallet to claim your Funko.";
  }
}


/* =========================================================
   CONTRACT ABI
   ========================================================= */

const FUNKO_ABI = [

  {
    type: "function",
    name: "claimFunko",
    stateMutability:
      "nonpayable",

    inputs: [
      {
        name: "_funkoType",
        type: "uint8"
      }
    ],

    outputs: []
  },

  {
    type: "function",
    name: "hasClaimed",
    stateMutability:
      "view",

    inputs: [
      {
        name: "",
        type: "address"
      }
    ],

    outputs: [
      {
        name: "",
        type: "bool"
      }
    ]
  },

  {
    type: "function",
    name: "totalMinted",
    stateMutability:
      "view",

    inputs: [],

    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ]
  }
];


/* =========================================================
   VIEM LOADER
   ========================================================= */

let viemModule = null;
let oxModule = null;


async function loadBlockchainLibraries() {

  if (
    viemModule &&
    oxModule
  ) {
    return;
  }

  viemModule =
    await import(
      "https://esm.sh/viem@2.45.0"
    );

  oxModule =
    await import(
      "https://esm.sh/ox/erc8021"
    );
}


/* =========================================================
   CONTRACT READ
   ========================================================= */

async function readHasClaimed(address) {

  await loadBlockchainLibraries();

  const {
    createPublicClient,
    http
  } = viemModule;

  const {
    base
  } =
    await import(
      "https://esm.sh/viem@2.45.0/chains"
    );

  const client =
    createPublicClient({
      chain: base,
      transport:
        http(CONFIG.rpc)
    });

  return await client.readContract({
    address:
      CONFIG.contract,

    abi:
      FUNKO_ABI,

    functionName:
      "hasClaimed",

    args: [
      address
    ]
  });
}


/* =========================================================
   CLAIM STATUS
   ========================================================= */

async function refreshClaimStatus() {

  if (!state.wallet) {
    return;
  }

  try {

    const claimed =
      await readHasClaimed(
        state.wallet
      );

    const button =
      document.getElementById(
        "claim-button"
      );

    const description =
      document.getElementById(
        "claim-description"
      );

    if (!button) return;

    if (claimed) {

      button.disabled = true;

      button.textContent =
        "Funko Claimed ✓";

      description.textContent =
        "This wallet has already claimed its Funko on Base Mainnet.";

    } else {

      button.disabled = false;

      button.textContent =
        "Claim Funko";

      description.textContent =
        "Your wallet is eligible to claim one Funko on Base Mainnet.";
    }

  } catch (error) {

    console.error(
      "Could not check claim status:",
      error
    );
  }
}


/* =========================================================
   CLAIM BUTTON
   ========================================================= */

function renderClaimButton() {

  const button =
    document.getElementById(
      "claim-button"
    );

  if (!button) return;

  if (!state.wallet) {

    button.disabled = false;

    button.textContent =
      "Connect Wallet";

  }
}


/* =========================================================
   REAL ONCHAIN CLAIM
   ========================================================= */

async function claimFunko() {

  if (!window.ethereum) {

    showModal(
      "🔗",
      "Wallet Required",
      "Connect a Base-compatible wallet first."
    );

    return;
  }

  try {

    /* -----------------------------------------
       Connect if needed
    ----------------------------------------- */

    if (!state.wallet) {

      await connectWallet();

      if (!state.wallet) {
        return;
      }
    }


    /* -----------------------------------------
       Force Base Mainnet
    ----------------------------------------- */

    await ensureBaseMainnet();


    /* -----------------------------------------
       Get active wallet
    ----------------------------------------- */

    const accounts =
      await window.ethereum.request({
        method:
          "eth_accounts"
      });

    if (!accounts.length) {
      throw new Error(
        "Wallet is not connected."
      );
    }

    const account =
      accounts[0];

    state.wallet =
      account;


    /* -----------------------------------------
       Check already claimed
    ----------------------------------------- */

    const alreadyClaimed =
      await readHasClaimed(
        account
      );

    if (alreadyClaimed) {

      await refreshClaimStatus();

      showModal(
        "🧸",
        "Already Claimed",
        "This wallet already has its Funko."
      );

      return;
    }


    /* -----------------------------------------
       Choose Funko type
    ----------------------------------------- */

    let funkoType =
      Math.floor(
        Math.random() *
        FUNKOS.length
      );

    /*
     * Small progression bonus:
     * higher level gives a chance at
     * higher Funko types.
     */
    if (state.level >= 5) {

      const roll =
        Math.random();

      if (roll < 0.08) {
        funkoType = 5;
      } else if (roll < 0.20) {
        funkoType = 4;
      } else if (roll < 0.45) {
        funkoType = 3;
      }
    }


    const selected =
      FUNKOS[funkoType];


    /* -----------------------------------------
       Load Viem + Builder Code
    ----------------------------------------- */

    await loadBlockchainLibraries();

    const {
      createWalletClient,
      custom,
      encodeFunctionData
    } = viemModule;

    const {
      Attribution
    } = oxModule;


    /* -----------------------------------------
       Generate official ERC-8021 suffix
    ----------------------------------------- */

    const dataSuffix =
      Attribution.toDataSuffix({
        codes: [
          CONFIG.builderCode
        ]
      });


    /* -----------------------------------------
       Encode claimFunko(uint8)
    ----------------------------------------- */

    const calldata =
      encodeFunctionData({
        abi:
          FUNKO_ABI,

        functionName:
          "claimFunko",

        args: [
          funkoType
        ]
      });


    /* -----------------------------------------
       Append Builder Code attribution
    ----------------------------------------- */

    const transactionData =
      calldata +
      dataSuffix.slice(2);


    /* -----------------------------------------
       Wallet client
    ----------------------------------------- */

    const walletClient =
      createWalletClient({
        chain:
          (
            await import(
              "https://esm.sh/viem@2.45.0/chains"
            )
          ).base,

        transport:
          custom(window.ethereum)
      });


    /* -----------------------------------------
       UI
    ----------------------------------------- */

    const button =
      document.getElementById(
        "claim-button"
      );

    button.disabled = true;

    button.textContent =
      "Confirm in Wallet...";


    showModal(
      selected.emoji,
      "Claim Your Funko",
      `${selected.name} is ready. Confirm the Base Mainnet transaction in your wallet.`
    );


    /*
     * Close modal so wallet interaction is visible.
     */
    setTimeout(
      closeModal,
      500
    );


    /* -----------------------------------------
       REAL BASE MAINNET TRANSACTION
    ----------------------------------------- */

    const txHash =
      await walletClient.sendTransaction({

        account,

        to:
          CONFIG.contract,

        data:
          transactionData
      });


    /* -----------------------------------------
       Transaction sent
    ----------------------------------------- */

    button.textContent =
      "Confirming...";


    showModal(
      "⏳",
      "Transaction Sent",
      `Your ${selected.name} claim is confirming on Base Mainnet.`
    );


    /* -----------------------------------------
       Wait for receipt
    ----------------------------------------- */

    const receipt =
      await waitForReceipt(
        txHash
      );


    if (
      !receipt ||
      receipt.status !==
        "0x1"
    ) {

      throw new Error(
        "The transaction failed on Base Mainnet."
      );
    }


    /* -----------------------------------------
       Success
    ----------------------------------------- */

    if (
      !state.collection.includes(
        funkoType
      )
    ) {

      state.collection.push(
        funkoType
      );
    }

    state.coins += 100;

    addXP(100);

    saveState();

    render();


    button.disabled = true;

    button.textContent =
      "Funko Claimed ✓";


    const explorerUrl =
      CONFIG.explorer +
      txHash;


    showModal(
      selected.emoji,
      "Funko Claimed! 🎉",
      `${selected.name} is now minted on Base Mainnet.`
    );


    console.log(
      "FUNKO QUEST CLAIM SUCCESS",
      {
        transaction:
          explorerUrl,

        transactionHash:
          txHash,

        contract:
          CONFIG.contract,

        wallet:
          account,

        funkoType,

        funko:
          selected.name,

        builderCode:
          CONFIG.builderCode,

        dataSuffix
      }
    );


    /*
     * Open transaction after a short delay.
     */
    setTimeout(() => {

      const modalMessage =
        document.getElementById(
          "modal-message"
        );

      if (modalMessage) {

        modalMessage.innerHTML = `
          ${selected.name} is now minted
          on Base Mainnet.
          <br><br>

          <a
            href="${explorerUrl}"
            target="_blank"
            rel="noopener"
            style="
              color:#5790ff;
              font-weight:800;
              text-decoration:none;
            "
          >
            View transaction →
          </a>
        `;
      }

    }, 100);

  } catch (error) {

    console.error(
      "FUNKO CLAIM ERROR:",
      error
    );

    const button =
      document.getElementById(
        "claim-button"
      );

    if (button) {

      button.disabled = false;

      button.textContent =
        "Claim Funko";
    }


    /*
     * User rejected the wallet transaction.
     */
    if (
      error &&
      (
        error.code === 4001 ||
        error.code === "ACTION_REJECTED"
      )
    ) {

      showModal(
        "↩️",
        "Transaction Cancelled",
        "You cancelled the wallet transaction."
      );

      return;
    }


    showModal(
      "⚠️",
      "Claim Failed",
      getErrorMessage(error)
    );
  }
}


/* =========================================================
   WAIT FOR TRANSACTION RECEIPT
   ========================================================= */

async function waitForReceipt(
  txHash,
  attempts = 60
) {

  for (
    let i = 0;
    i < attempts;
    i++
  ) {

    try {

      const receipt =
        await window.ethereum.request({
          method:
            "eth_getTransactionReceipt",

          params: [
            txHash
          ]
        });

      if (receipt) {
        return receipt;
      }

    } catch (error) {

      console.warn(
        "Receipt check:",
        error
      );
    }

    await sleep(2000);
  }

  throw new Error(
    "Transaction confirmation timed out. Check the transaction on Base Explorer."
  );
}


function sleep(ms) {

  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        ms
      )
  );
}


/* =========================================================
   MODAL
   ========================================================= */

function showModal(
  icon,
  title,
  message
) {

  const modal =
    document.getElementById(
      "modal"
    );

  if (!modal) return;

  document.getElementById(
    "modal-icon"
  ).textContent =
    icon;

  document.getElementById(
    "modal-title"
  ).textContent =
    title;

  document.getElementById(
    "modal-message"
  ).textContent =
    message;

  modal.classList.remove(
    "hidden"
  );
}


function closeModal() {

  const modal =
    document.getElementById(
      "modal"
    );

  if (modal) {

    modal.classList.add(
      "hidden"
    );
  }
}


/* =========================================================
   ERROR MESSAGE
   ========================================================= */

function getErrorMessage(error) {

  if (!error) {
    return "Something went wrong.";
  }

  if (
    error.shortMessage
  ) {
    return error.shortMessage;
  }

  if (
    error.reason
  ) {
    return error.reason;
  }

  if (
    error.message
  ) {
    return error.message;
  }

  return "The transaction could not be completed.";
}


/* =========================================================
   RESET LOCAL GAME
   ========================================================= */

function resetLocalGame() {

  const confirmed =
    window.confirm(
      "Reset your local Funko Quest progress? This does NOT undo any NFTs already minted on Base."
    );

  if (!confirmed) {
    return;
  }

  state = {
    level: 1,
    xp: 0,
    coins: 0,
    streak: 0,
    score: 0,
    collection: [],
    dailyClaimed: null,
    lastGame: null,
    wallet: state.wallet
  };

  saveState();

  render();

  showModal(
    "🔄",
    "Game Reset",
    "Your local game progress was reset. Existing onchain NFTs are not affected."
  );
}


/* =========================================================
   WALLET EVENTS
   ========================================================= */

function setupWalletEvents() {

  if (!window.ethereum) {
    return;
  }

  window.ethereum.on(
    "accountsChanged",
    async (accounts) => {

      if (!accounts.length) {

        state.wallet = null;

        saveState();

        updateWalletUI();

        renderClaimButton();

        return;
      }

      state.wallet =
        accounts[0];

      saveState();

      updateWalletUI();

      await refreshClaimStatus();
    }
  );


  window.ethereum.on(
    "chainChanged",
    async (chainId) => {

      if (
        chainId.toLowerCase() !==
        CONFIG.chainId
      ) {

        showModal(
          "🔵",
          "Base Mainnet Required",
          "Please switch your wallet back to Base Mainnet."
        );

      } else {

        await refreshClaimStatus();
      }
    }
  );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

async function init() {

  loadState();

  buildGameUI();

  setupWalletEvents();

  /*
   * If a wallet was previously connected,
   * check whether it is still connected.
   */
  if (window.ethereum) {

    try {

      const accounts =
        await window.ethereum.request({
          method:
            "eth_accounts"
        });

      if (accounts.length) {

        const chainId =
          await window.ethereum.request({
            method:
              "eth_chainId"
          });

        if (
          chainId.toLowerCase() ===
          CONFIG.chainId
        ) {

          state.wallet =
            accounts[0];

          saveState();

          updateWalletUI();

          await refreshClaimStatus();

        } else {

          state.wallet = null;

          saveState();

          updateWalletUI();
        }
      }

    } catch (error) {

      console.warn(
        "Wallet initialization:",
        error
      );
    }
  }

  render();
}


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

} else {

  init();
}
