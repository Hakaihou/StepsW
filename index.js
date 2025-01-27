document.addEventListener("DOMContentLoaded", () => {
    const currentLang = document.documentElement.getAttribute("lang") || "en";
    const translationsPath = "./StepsW/translate.json"; // Путь к файлу с переводами

    // Загрузка переводов из JSON
    fetch(translationsPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки переводов: ${response.status}`);
            }
            return response.json();
        })
        .then(translations => {
            const translationsForLang = translations[currentLang];
            if (!translationsForLang) {
                console.warn(`Переводы для языка "${currentLang}" не найдены.`);
                return;
            }

            // Замена текста в элементах с data-i18n
            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.getAttribute("data-i18n");
                if (translationsForLang[key]) {
                    el.innerHTML = translationsForLang[key];
                } else {
                }
            });

            // Замена placeholder в элементах с data-i18n-placeholder
            document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
                const key = el.getAttribute("data-i18n-placeholder");
                if (translationsForLang[key]) {
                    el.placeholder = translationsForLang[key];
                } else {
                }
            });

            // Замена value в элементах с data-i18n-value
            document.querySelectorAll("[data-i18n-value]").forEach(el => {
                const key = el.getAttribute("data-i18n-value");
                if (translationsForLang[key]) {
                    el.value = translationsForLang[key];
                } else {
                }
            });
        })
        .catch(error => {
            console.error("Ошибка при загрузке или обработке переводов:", error);
        });

// Функционал обновления времени до полуночи
    function updateTimeToMidnight() {
        const timeElement = document.getElementById("steps-widget-time");
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);

        const timeRemaining = midnight - now;
        const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
        const seconds = Math.floor((timeRemaining / 1000) % 60);

        const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        timeElement.textContent = formattedTime;
    }

    setInterval(updateTimeToMidnight, 1000);
    updateTimeToMidnight();

    // Функционал появления виджета при скролле
    // Выбираем все элементы, которые будем отслеживать
    const stepsWidgetItems = document.querySelectorAll(".steps-widget-item");

    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    };

    // Создаём экземпляр IntersectionObserver
    const itemObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // При появлении элемента на экране добавляем класс для анимации/плавного появления
                entry.target.classList.add("steps-widget-item-visible");

                // После того как элемент стал видимым, снимаем наблюдение, чтобы не повторять анимацию
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Запускаем наблюдение за каждым steps-widget-item
    stepsWidgetItems.forEach(item => {
        itemObserver.observe(item);
    });


    // Функционал обратного отсчёта
    const element = document.getElementById("steps-widget-remain");
    const localStorageKey = "steps-widget-remain-value";
    const minValue = 39;
    let isCounting = false;
    let count = 4;

    function initializeValue() {
        const savedValue = localStorage.getItem(localStorageKey);
        if (savedValue !== null) {
            const value = Math.max(parseInt(savedValue, 10), minValue);
            element.textContent = value;
        } else {
            localStorage.setItem(localStorageKey, element.textContent);
        }
    }

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function startCountdown() {
        if (isCounting || count === 0) return;
        isCounting = true;

        let currentValue = parseInt(element.textContent, 10);

        const interval = setInterval(() => {
            if (count > 0 && currentValue > minValue) {
                currentValue -= 1;
                element.textContent = currentValue;
                localStorage.setItem(localStorageKey, currentValue);
                count -= 1;
            } else {
                clearInterval(interval);
            }
        }, 3000);
    }

    window.addEventListener("scroll", () => {
        if (isElementInViewport(element)) {
            startCountdown();
        }
    });

    initializeValue();
});
