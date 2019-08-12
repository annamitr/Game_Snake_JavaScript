const FIELD_SIZE_X = 22;   //Размер поля по оси X
const FIELD_SIZE_Y = 17;   //Размер поля по оси Y

let snake = [];  //Сама змейка
let snakeSpeed = 200; //Скорость движения змейки
let snakeDirection = "x+"; //Текущее направление змейки 
let snakeTimer; //Таймер змейки

let foodTimer; //Таймер появления еды
let foodCreationSpeed = 500; //Скорость появления еды
let numberOfFood = [1, 0]; // 1 - максимальное количество еды, 0 - количество на поле

let score = 0; //Очки

let gameIsRunning = false; //Статус игры (по умолчанию false)

/*
** Функция подготовки игрового поля
*/
function prepareGameField() {
    let gameTable = document.createElement("table");
    gameTable.setAttribute("class", "game-table");
    
    //Цикл, генерирующий ячейки игрового поля
    for(let y = 0; y < FIELD_SIZE_Y; y++) {
        let row = document.createElement("tr");
        row.setAttribute("class", "game-table-row row-" + y);
        
        for(let x = 0; x < FIELD_SIZE_X; x++) {
            let cell = document.createElement("td");
            cell.setAttribute("class", "game-table-cell cell-" + x + "-" + y);
            
            row.appendChild(cell);
        }
        gameTable.appendChild(row);
    }
    document.querySelector(".snake-field").appendChild(gameTable);
}

/*
** Инициализация игрового пространства
*/
function init() {
    prepareGameField();
    
    //Обработчики на кнопки Start и New game
    document.querySelector(".snake-start").addEventListener("click", startGame);
    document.querySelector(".snake-renew").addEventListener("click", renewGame);
    
    //Событие-прослушка клавиатуры
    addEventListener("keydown", changeSnakeDirection);
}

/*
** Генерация змейки
** Змейка будет состоять из двух элементов (два блока - голова и туловище)
** Змейка выползает по центру поля
** Класс ячейки змейки - snake-unit
*/
function respawn() {
    let startCoordX = Math.floor(FIELD_SIZE_X / 2);
    let startCoordY = Math.floor(FIELD_SIZE_Y / 2);
    
    let snakeHead = document.querySelector(".cell-" + startCoordX + "-" + startCoordY);
    let prevSnakeAttr = snakeHead.getAttribute("class");
    snakeHead.setAttribute("class", prevSnakeAttr + " snake-unit");
    
    let snakeTail = document.querySelector(".cell-" + (startCoordX - 1) + "-" + startCoordY);
    let prevSnakeTailAttr = snakeTail.getAttribute("class");
    snakeTail.setAttribute("class", prevSnakeTailAttr + " snake-unit");
    
    //Добавляем в массив ссылки на ячейки хвоста и головы
    snake.push(snakeTail);
    snake.push(snakeHead);
}

function moveSnake() {
    if (gameIsRunning == true) {
        //Соберем классы головы змейки
        let snakeHeadClasses = snake[snake.length - 1].getAttribute("class").split(" ");
        //console.log(snakeHeadClasses);

        //Сдвигаем голову на 1 ячейку:
        let newUnit; //Переменная новой ячейки для головы
        let snakeCoords = snakeHeadClasses[1].split("-");
        //console.log(snakeCoords);
        let coordX = parseInt(snakeCoords[1]);
        let coordY = parseInt(snakeCoords[2]);

        /*
         ** Чтобы змейка проходила сквозь стену
         */
        if (coordX >= FIELD_SIZE_X - 1 && snakeDirection == "x+") {
            coordX = -1;
        }
        if (coordX <= 0 && snakeDirection == "x-") {
            coordX = FIELD_SIZE_X;
        }
        if (coordY >= FIELD_SIZE_Y - 1 && snakeDirection == "y+") {
            coordY = -1;
        }
        if (coordY <= 0 && snakeDirection == "y-") {
            coordY = FIELD_SIZE_Y;
        }

        /*
         ** Передвижение змеи согласно выбранному направлению
         */
        if (snakeDirection == "x+") {
            newUnit = document.querySelector(".cell-" + (coordX + 1) + "-" + coordY);
        } else if (snakeDirection == "x-") {
            newUnit = document.querySelector(".cell-" + (coordX - 1) + "-" + coordY);
        } else if (snakeDirection == "y+") {
            newUnit = document.querySelector(".cell-" + coordX + "-" + (coordY + 1));
        } else if (snakeDirection == "y-") {
            newUnit = document.querySelector(".cell-" + coordX + "-" + (coordY - 1));
        }

        /*
         ** Игра продолжается до тех пор, пока змейка не наедет сама на себя
         */
        // Разбивка классов головы змейки newUnitClasses:
        let newUnitClasses = newUnit.getAttribute("class").split(" ");

        // Проверка на то, что голова не ест свое тело:
        if (!newUnitClasses.includes("snake-unit")) {
            //Добавляем новую часть змейки
            newUnit.setAttribute("class", newUnit.getAttribute("class") + " snake-unit");
            snake.push(newUnit);

            //Подчищаем хвост, до тех пор, пока голова змейки не попадет на ячейку с классом .food-unit
            if (!newUnitClasses.includes("food-unit")) {
                let removeSnake = snake.splice(0, 1)[0]; //Находим удаляемый элемент
                let classes = removeSnake.getAttribute("class").split(" ");
                //Удаление маркирующего классa snake-unit
                removeSnake.setAttribute("class", classes[0] + " " + classes[1]);
            } else {
                numberOfFood[1]--;
                score++;
                let snakeScore = document.querySelector(".snake-score");
                snakeScore.innerHTML = "Score: " + score;
            }
        } else {
            finishTheGame();
        }
    }
}

/*
** Функция размещения еды на поле
*/
function createFood() {
    if (numberOfFood[1] < numberOfFood[0]) {
        let foodCreated = false;

        while (!foodCreated) {
            //Выбираем случайную клетку
            let foodX = Math.floor(Math.random() * (FIELD_SIZE_X));
            let foodY = Math.floor(Math.random() * (FIELD_SIZE_Y));

            let foodCell = document.querySelector(".cell-" + foodX + "-" + foodY);
            let foodCellClasses = foodCell.getAttribute("class").split(" ");

            //Если тут нет змейки, то размещаем еду
            if (!foodCellClasses.includes("snake-unit")) {
                //Ставим в выбранную ячейку еду
                foodCell.setAttribute("class", foodCellClasses.join(" ") + " food-unit");
                foodCreated = true;
                numberOfFood[1]++;
            }
        }
    }
}

/*
** Функция старта игры
*/
function startGame() {
    gameIsRunning = true;
    respawn();
    
    snakeTimer = setInterval(moveSnake, snakeSpeed);
    foodTimer = setInterval(createFood, foodCreationSpeed);
}

/*
** Функция смены направления змейки
*/
function changeSnakeDirection(e) {
    console.log(e.keyCode);
    switch (e.keyCode) {
        case 37: //Если нажата клавиша влево
            if (snakeDirection != "x+") {
                snakeDirection = "x-";
            }
            break;
        case 38: //Если нажата клавиша вверх
            if (snakeDirection != "y+") {
                snakeDirection = "y-";
            }
            break;
        case 39: //Если нажата клавиша вправо
            if (snakeDirection != "x-") {
                snakeDirection = "x+";
            }
            break;
        case 40: //Если нажата клавиша вниз
            if (snakeDirection != "y-") {
                snakeDirection = "y+";
            }
            break;
    }
}

/*
** Функция перезагрузки игры
*/
function renewGame() {
    location.reload();
}

/*
** Информация о том, что игра окончена!
*/
function finishTheGame() {
    gameIsRunning = false;
    
    alert("Игра окончена! Счет: " + score + " Научись играть =)");
}

window.onload = init;

