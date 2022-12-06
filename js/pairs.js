import { cards } from './cards-array.js';

(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const WAIT_TIME_MS = 1000;
        let cardsArray;
        let openedCards = [];
        let rowsAndColumns;
        let cardSize;

        // Создаем и возвращаем карточку
        function createCard(object) {
            const card = document.createElement('div');
            const cardFront = document.createElement('img');
            const cardBack = document.createElement('img');
            // Вычисляем ширину/высоту карточек в зависимости от числа рядов/строк, закладывая margin 7px
            cardSize = ((100 - 7) / rowsAndColumns);

            card.classList.add('card');
            card.dataset.path = object.alt;
            card.style.width = cardSize + '%';
            card.style.height = cardSize + '%';

            cardFront.classList.add('card__front');
            cardFront.src = object.imgUrl;
            cardFront.alt = object.alt;
            cardBack.classList.add('card__back');
            cardBack.src = 'img/card-back.jpg';
            cardBack.alt = 'Koi';

            card.append(cardFront);
            card.append(cardBack);

            return {
                card,
                cardFront,
                cardBack
            }
        }

        // Создаем доску с карточками
        const cardWrapper = document.querySelector('.cards__wrapper');

        function createField(array) {
            clearField();
            // Сколько нужно сгенерировать карточек:
            let count = (rowsAndColumns * rowsAndColumns) / 2;
            // Временный массив для перемешанного импортируемого массива, чтобы при каждом формировании доски генерировались разные карточки:
            let tempArray = shuffle(array);
            // Генерируем карточки
            for (let i = 0; i < count; i++) {

                let card = createCard(tempArray[i]);
                let cardDuplicate = createCard(tempArray[i]);

                cardWrapper.append(card.card);
                cardWrapper.append(cardDuplicate.card);
            }
            // Собираем их в массив, перемешиваем и переставляем местами в разметке
            cardsArray = Array.from(document.querySelectorAll('.card'));
            shuffle(cardsArray);
            for (let i = 0; i < cardsArray.length; ++i) {
                cardsArray[i].style.order = i;
            }
        }

        // Очистка доски от карточек
        function clearField() {
            openedCards = [];
            while (cardWrapper.firstChild) {
                cardWrapper.removeChild(cardWrapper.firstChild);
            }
            stopSetInterval();
            minutes.textContent = '01';
            seconds.textContent = '00';
            minutesLeft = parseInt(minutes.textContent);
            secondsLeft = parseInt(seconds.textContent);
        }

        // Перемешиваем карты
        function shuffle(array) {
            let currentIndex = array.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }

        // Функция, переворачивающая карты
        let hasFlippedCards = false;
        let firstCard;
        let secondCard;
        let stopFlip = false;

        function flipCards() {
            if (stopFlip) return;
            if (this === firstCard) return;

            this.classList.add('flip');

            if (!hasFlippedCards) {
                firstCard = this;
                hasFlippedCards = true;
                return
            }
            secondCard = this;
            hasFlippedCards = false;

            checkForMatch();
        }

        // Проверяем совпадение
        function checkForMatch() {
            let isMatch = firstCard.dataset.path === secondCard.dataset.path;
            isMatch ? disableCards() : unflipCards();
        }

        // Если карты совпали, снимаем с них обработчик клика и проверяем, не пора ли закончить игру
        function disableCards() {
            firstCard.removeEventListener('click', flipCards);
            secondCard.removeEventListener('click', flipCards);
            openedCards.push(firstCard, secondCard);
            finishGame();
        }

        // Если карты не совпали, переворачиваем их рубашкой вверх
        function unflipCards() {
            stopFlip = true;
            setTimeout(() => {
                firstCard.classList.remove('flip');
                secondCard.classList.remove('flip');
                stopFlip = false;
                firstCard = null;
                secondCard = null;
            }, WAIT_TIME_MS);
        }

        // Конец игры
        const popupSuccess = document.querySelector('.popup--success');
        const popupFail = document.querySelector('.popup--fail');
        const restartBtns = document.querySelectorAll('.restart');

        function finishGame() {
            openedCards.forEach(openedCard => {
                openedCard.addEventListener('transitionend', () => {
                    if (openedCards.length === cardsArray.length) {
                        popupSuccess.classList.add('popup--active');
                        timer.classList.remove('timer--active');
                        restartGame();
                    }
                })
            })
        }

        // Перезапуск игры
        function restartGame() {
            restartBtns.forEach(restartBtn => {
                restartBtn.onclick = function () {
                    stopFlip = false;
                    popupSuccess.classList.remove('popup--active');
                    popupFail.classList.remove('popup--active');
                    timer.classList.remove('timer--active');
                    clearField();
                }
            })
        };

        // Таймер
        const timer = document.querySelector('.timer');
        let minutes = document.querySelector('.minutes');
        let seconds = document.querySelector('.seconds');
        let minutesLeft = parseInt(minutes.textContent);
        let secondsLeft = parseInt(seconds.textContent);

        let intervalID;

        function startCountdown() {
            if (secondsLeft === 0) {
                secondsLeft = 60;
                minutesLeft = '00';
                minutes.textContent = minutesLeft;
            };

            secondsLeft--;
            seconds.textContent = secondsLeft;

            if (secondsLeft < 10) {
                seconds.textContent = '0' + secondsLeft;
            };

            if (minutesLeft === '00' && secondsLeft === 0) {
                popupFail.classList.add('popup--active');
                restartGame();
                stopSetInterval();
            };
        };

        function goSetInterval() {
            timer.classList.add('timer--active');
            intervalID = setInterval(startCountdown, 1000);
        }

        function stopSetInterval() {
            clearInterval(intervalID);
        }

        // Начало игры
        function startGame() {
            const startForm = document.querySelector('.form');
            const input = document.querySelector('.input');

            // Игра начинается, когда в поле ввода вводится значение строк/столбцов
            startForm.addEventListener('submit', function (evt) {
                evt.preventDefault();

                if (input.value === '') {
                    alert('Сначала выбери сложность!');
                };

                // Получаем количество строк и столбцов
                if (input.value !== '') {
                    if (input.value % 2 === 0) {
                        if (input.value >= 2 && input.value <= 10) {
                            rowsAndColumns = input.value;
                            input.value = '';

                            // Создаем разметку с карточками
                            createField(cards);

                            if (rowsAndColumns < 6) {
                                // Запускается обратный отсчет
                                goSetInterval()
                            }

                        } else {
                            alert('Введи число от 2 до 10');
                        }
                    } else {
                        alert('Введи четное число');
                    }
                };



                // По клику на карты, они будут переворачиваться
                cardsArray.forEach(card => {
                    card.addEventListener('click', flipCards);
                });
            });
        };

        startGame();
    });
})();
