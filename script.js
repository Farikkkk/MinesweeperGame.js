document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  const flagsLeft = document.querySelector("#flags-left");
  const result = document.querySelector("#result");
  const timerDisplay = document.querySelector("#timer");
  const resetBtn = document.querySelector(".reset-button");

  const width = 10;
  let bombAmount = 20;
  let squares = [];
  let isGameOver = false;
  let flags = 0;
  let timer;
  let timeElapsed = 0;
  let timerStarted = false;
  let lastTouch = 0;

  function createBoard() {
    flagsLeft.innerHTML = bombAmount;

    const bombArray = Array(bombAmount).fill("bomb");
    const emptyArray = Array(width * width - bombAmount).fill("valid");
    const gameArray = emptyArray.concat(bombArray);
    const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement("div");
      square.id = i;
      square.classList.add(shuffledArray[i]);
      grid.appendChild(square);
      squares.push(square);

      square.addEventListener("click", () => {
        click(square);
        if (!timerStarted) {
          startTimer();
          timerStarted = true;
        }
      });

      square.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        addFlag(square);
      });

      square.addEventListener("touchstart", (event) => {
        const now = Date.now();
        const delta = now - lastTouch;
        lastTouch = now;

        if (delta < 300) {
          event.preventDefault(); // Предотвратить стандартное поведение
          // Обработать двойное касание здесь
          if (square.classList.contains("checked")) {
            return; // Если ячейка уже открыта, не делаем ничего
          }

          if (square.classList.contains("flag")) {
            // Если на ячейке уже есть флаг, убираем его
            square.classList.remove("flag");
            flags--;
            square.innerHTML = "";
            flagsLeft.innerHTML = bombAmount - flags;
          } else {
            // Если на ячейке нет флага, ставим его
            square.classList.add("flag");
            flags++;
            flagsLeft.innerHTML = bombAmount - flags;
            square.innerHTML = "🚩";
            checkForWin();
          }
        }
      });
    }

    //add numbers
    for (let i = 0; i < squares.length; i++) {
      let total = 0;
      let isLeftEdge = i % width === 0;
      let isRightEdge = i % width === width - 1;

      if (squares[i].classList.contains("valid")) {
        if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains("bomb"))
          total++;
        if (
          i > 9 &&
          !isRightEdge &&
          squares[i + 1 - width].classList.contains("bomb")
        )
          total++;
        if (i > 10 && squares[i - width].classList.contains("bomb")) total++;
        if (
          i > 11 &&
          !isLeftEdge &&
          squares[i - width - 1].classList.contains("bomb")
        )
          total++;
        if (i < 99 && !isRightEdge && squares[i + 1].classList.contains("bomb"))
          total++;
        if (
          i < 90 &&
          !isLeftEdge &&
          squares[i - 1 + width].classList.contains("bomb")
        )
          total++;
        if (
          i < 88 &&
          !isRightEdge &&
          squares[i + 1 + width].classList.contains("bomb")
        )
          total++;
        if (i < 89 && squares[i + width].classList.contains("bomb")) total++;
        squares[i].setAttribute("data", total);
      }
    }
  }

  function startTimer() {
    timer = setInterval(() => {
      timeElapsed++;
      const minutes = Math.floor(timeElapsed / 60);
      const seconds = timeElapsed % 60;
      const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
      timerDisplay.innerHTML = formattedTime;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timer);
  }

  function addFlag(square) {
    if (isGameOver) return;

    if (!square.classList.contains("checked") && flags < bombAmount) {
      if (!square.classList.contains("flag")) {
        square.classList.add("flag");
        flags++;
        square.innerHTML = "🚩";
        flagsLeft.innerHTML = bombAmount - flags;
        checkForWin();
      } else {
        square.classList.remove("flag");
        flags--;
        square.innerHTML = "";
        flagsLeft.innerHTML = bombAmount - flags;
      }
    }
  }

  createBoard();

  function click(square) {
    if (
      isGameOver ||
      square.classList.contains("checked") ||
      square.classList.contains("flag")
    )
      return;

    if (square.classList.contains("bomb")) {
      gameOver();
    } else {
      let total = square.getAttribute("data");

      if (total != 0) {
        square.classList.add("checked");
        if (total == 1) square.classList.add("one");
        if (total == 2) square.classList.add("two");
        if (total == 3) square.classList.add("three");
        if (total == 4) square.classList.add("four");
        square.innerHTML = total;
        return;
      }
      checkSquare(square);
    }
    square.classList.add("checked");
  }

  function checkSquare(square) {
    const currentId = square.id;
    const isLeftEdge = currentId % width === 0;
    const isRightEdge = currentId % width === width - 1;

    setTimeout(() => {
      if (currentId > 0 && !isLeftEdge) {
        const newId = parseInt(currentId) - 1;
        const newSquare = document.getElementById(newId);
        if (
          !newSquare.classList.contains("checked") &&
          !newSquare.classList.contains("bomb")
        ) {
          click(newSquare);
        }
      }

      if (currentId > 9 && !isRightEdge) {
        const newId = parseInt(currentId) + 1 - width;
        const newSquare = document.getElementById(newId);
        if (
          !newSquare.classList.contains("checked") &&
          !newSquare.classList.contains("bomb")
        ) {
          click(newSquare);
        }
      }

      if (currentId > 10) {
        const newId = parseInt(currentId) - width;
        const newSquare = document.getElementById(newId);
        if (
          !newSquare.classList.contains("checked") &&
          !newSquare.classList.contains("bomb")
        ) {
          click(newSquare);
        }
      }

      if (currentId > 11 && !isLeftEdge) {
        const newId = parseInt(currentId) - 1 - width;
        const newSquare = document.getElementById(newId);
        if (
          !newSquare.classList.contains("checked") &&
          !newSquare.classList.contains("bomb")
        ) {
          click(newSquare);
        }
      }

      if (currentId < 98 && !isRightEdge) {
        const newId = parseInt(currentId) + 1;
        const newSquare = document.getElementById(newId);
        if (
          !newSquare.classList.contains("checked") &&
          !newSquare.classList.contains("bomb")
        ) {
          click(newSquare);
        }
      }

      if (currentId < 90 && !isLeftEdge) {
        const newId = parseInt(currentId) - 1 + width;
        const newSquare = document.getElementById(newId);
        if (
          !newSquare.classList.contains("checked") &&
          !newSquare.classList.contains("bomb")
        ) {
          click(newSquare);
        }
      }

      if (currentId < 88 && !isRightEdge) {
        const newId = parseInt(currentId) + 1 + width;
        const newSquare = document.getElementById(newId);
        if (
          !newSquare.classList.contains("checked") &&
          !newSquare.classList.contains("bomb")
        ) {
          click(newSquare);
        }
      }

      if (currentId < 89) {
        const newId = squares[parseInt(currentId) + width].id;
        const newSquare = document.getElementById(newId);
        if (
          !newSquare.classList.contains("checked") &&
          !newSquare.classList.contains("bomb")
        ) {
          click(newSquare);
        }
      }
    }, 10);
  }

  function checkForWin() {
    let matches = 0;
    for (let i = 0; i < squares.length; i++) {
      if (
        squares[i].classList.contains("flag") &&
        squares[i].classList.contains("bomb")
      ) {
        matches++;
      }

      if (matches === bombAmount) {
        result.innerHTML = "YOU WIN !!! 😎";
        isGameOver = true;
        stopTimer();
      }
    }
  }

  resetBtn.addEventListener("click", () => {
    resetGame();
  });

  function resetGame() {
    clearInterval(timer);
    grid.innerHTML = "";
    flagsLeft.innerHTML = "";
    result.innerHTML = "";
    timerDisplay.innerHTML = "00:00";
    isGameOver = false;
    flags = 0;
    timeElapsed = 0;
    timerStarted = false;
    createBoard();
  }

  function gameOver() {
    result.innerHTML = "BOOM! Game Over! 😭";
    stopTimer();
    isGameOver = true;

    squares.forEach((square) => {
      if (square.classList.contains("bomb")) {
        square.innerHTML = "💣";
        square.classList.remove("bomb");
        square.classList.add("checked");
      }
    });
  }
});
