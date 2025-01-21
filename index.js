document.addEventListener("DOMContentLoaded", () => {
    const langAttribute = document.documentElement.getAttribute("lang") || "en";
    const baseLang = langAttribute.split("-")[0]; // Извлекаем первую часть языка (например, "en" из "en-US")
    const translationsPath = "./translate.json"; // Путь к JSON-файлу с переводами

    // Загружаем JSON с переводами
    fetch(translationsPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки переводов: ${response.status}`);
            }
            return response.json();
        })
        .then(translations => {
            const translationsForLang = translations[baseLang];
            if (!translationsForLang) {
                console.warn(`Переводы для языка "${baseLang}" не найдены.`);
                return;
            }

            // Замена текста, включая HTML, в элементах с data-i18n
            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.getAttribute("data-i18n");
                const translation = translationsForLang[key];
                if (translation) {
                    el.innerHTML = translation; // Вставляем текст с HTML
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
    const stepsWidget = document.querySelector("#steps-widget");

    const observerOptions = {
        root: null,
        threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                stepsWidget.classList.add("steps-widget-visible");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    observer.observe(stepsWidget);

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
