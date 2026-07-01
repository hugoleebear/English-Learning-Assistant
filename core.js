/*==========================================================
 English Learning Assistant
 core.js
 Part 1
==========================================================*/

"use strict";

/*==========================================================
 Global Config
==========================================================*/

const APP_CONFIG = {

    HISTORY_LIMIT: 10,

    STORAGE_HISTORY: "ela_history",

    STORAGE_FAVORITE: "ela_favorite",

    API: {

        DICTIONARY: "https://api.dictionaryapi.dev/api/v2/entries/en/",

        TRANSLATE: "https://api.mymemory.translated.net/get",

        DATAMUSE: "https://api.datamuse.com/words"

    }

};

/*==========================================================
 Core Object
==========================================================*/

const Core = {

    /*------------------------------------------
      LocalStorage
    ------------------------------------------*/

    load(key, defaultValue = []) {

        try {

            const data = localStorage.getItem(key);

            if (!data) return defaultValue;

            return JSON.parse(data);

        } catch {

            return defaultValue;

        }

    },

    save(key, value) {

        localStorage.setItem(

            key,

            JSON.stringify(value)

        );

    },

    /*------------------------------------------
      History
    ------------------------------------------*/

    getHistory() {

        return this.load(

            APP_CONFIG.STORAGE_HISTORY,

            []

        );

    },

    saveHistory(keyword) {

        let history = this.getHistory();

        history = history.filter(

            item => item !== keyword

        );

        history.unshift(keyword);

        if (history.length > APP_CONFIG.HISTORY_LIMIT) {

            history = history.slice(

                0,

                APP_CONFIG.HISTORY_LIMIT

            );

        }

        this.save(

            APP_CONFIG.STORAGE_HISTORY,

            history

        );

    },

    clearHistory() {

        this.save(

            APP_CONFIG.STORAGE_HISTORY,

            []

        );

    },

    /*------------------------------------------
      Favorite
    ------------------------------------------*/

    getFavorite() {

        return this.load(

            APP_CONFIG.STORAGE_FAVORITE,

            []

        );

    },

    saveFavorite(list) {

        this.save(

            APP_CONFIG.STORAGE_FAVORITE,

            list

        );

    },

    toggleFavorite(word) {

        let favorite = this.getFavorite();

        const index = favorite.indexOf(word);

        if (index === -1) {

            favorite.unshift(word);

        } else {

            favorite.splice(index, 1);

        }

        this.saveFavorite(favorite);

    },

    isFavorite(word) {

        return this.getFavorite().includes(word);

    },

    clearFavorite() {

        this.saveFavorite([]);

    },

    /*------------------------------------------
      Text Type
    ------------------------------------------*/

    detectType(text) {

        const value = text.trim();

        if (!value) return "";

        if (value.split(" ").length >= 4) {

            return "grammar";

        }

        if (value.includes(" ")) {

            return "phrase";

        }

        return "word";

    },

    /*------------------------------------------
      IPA -> KK
    ------------------------------------------*/

    ipaToKK(ipa = "") {

        if (!ipa) {

            return "需查證";

        }

        let kk = ipa;

        kk = kk.replace(/iː/g, "i");

        kk = kk.replace(/ɪ/g, "ɪ");

        kk = kk.replace(/eɪ/g, "e");

        kk = kk.replace(/ɛ/g, "ɛ");

        kk = kk.replace(/æ/g, "æ");

        kk = kk.replace(/ɑː/g, "ɑ");

        kk = kk.replace(/ʌ/g, "ʌ");

        kk = kk.replace(/ɔː/g, "ɔ");

        kk = kk.replace(/oʊ/g, "o");

        kk = kk.replace(/uː/g, "u");

        kk = kk.replace(/ʊ/g, "ʊ");

        kk = kk.replace(/ɝ/g, "ɝ");

        kk = kk.replace(/ɚ/g, "ɚ");

        kk = kk.replace(/\//g, "");

        return kk.trim() || "需查證";

    },
    /*------------------------------------------
      Fetch Dictionary API
    ------------------------------------------*/

    async fetchDictionary(word) {

        const response = await fetch(

            APP_CONFIG.API.DICTIONARY +

            encodeURIComponent(word)

        );

        if (!response.ok) {

            throw new Error("Dictionary API Error");

        }

        return await response.json();

    },

    /*------------------------------------------
      Fetch Translation
    ------------------------------------------*/

    async fetchTranslation(text) {

        const url =
            `${APP_CONFIG.API.TRANSLATE}?q=${encodeURIComponent(text)}&langpair=en|zh-TW`;

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error("Translation API Error");

        }

        return await response.json();

    },

    /*------------------------------------------
      Fetch Datamuse
    ------------------------------------------*/

    async fetchDatamuse(word) {

        const url =
            `${APP_CONFIG.API.DATAMUSE}?ml=${encodeURIComponent(word)}&max=5`;

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error("Datamuse API Error");

        }

        return await response.json();

    },

    /*------------------------------------------
      Build Yahoo Dictionary URL
    ------------------------------------------*/

    buildYahooUrl(word) {

        return `https://tw.dictionary.search.yahoo.com/search?p=${encodeURIComponent(word)}`;

    },

    /*------------------------------------------
      Audio
    ------------------------------------------*/

    playAudio(url) {

        if (!url) {

            return;

        }

        const audio = new Audio(url);

        audio.play();

    },

    /*------------------------------------------
      HTML Escape
    ------------------------------------------*/

    escapeHTML(text = "") {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    },

    /*------------------------------------------
      Create Element
    ------------------------------------------*/

    createElement(tag, className = "", html = "") {

        const element = document.createElement(tag);

        if (className) {

            element.className = className;

        }

        if (html) {

            element.innerHTML = html;

        }

        return element;

    },

    /*------------------------------------------
      Empty Element
    ------------------------------------------*/

    clearElement(element) {

        while (element.firstChild) {

            element.removeChild(element.firstChild);

        }

    },

    /*------------------------------------------
      Delay
    ------------------------------------------*/

    wait(ms = 300) {

        return new Promise(resolve => {

            setTimeout(resolve, ms);

        });

    },
    /*------------------------------------------
      Loading
    ------------------------------------------*/

    showLoading() {

        const loading = document.getElementById("loadingOverlay");

        if (loading) {

            loading.classList.add("active");

        }

    },

    hideLoading() {

        const loading = document.getElementById("loadingOverlay");

        if (loading) {

            loading.classList.remove("active");

        }

    },

    /*------------------------------------------
      Result Card
    ------------------------------------------*/

    hideAllCards() {

        document
            .getElementById("welcomeCard")
            ?.classList.add("hidden");

        document
            .getElementById("resultCard")
            ?.classList.add("hidden");

        document
            .getElementById("errorCard")
            ?.classList.add("hidden");

    },

    showResultCard() {

        this.hideAllCards();

        document
            .getElementById("resultCard")
            ?.classList.remove("hidden");

    },

    showError(message = "No result found.") {

        this.hideAllCards();

        const errorMessage = document.getElementById("errorMessage");

        if (errorMessage) {

            errorMessage.textContent = message;

        }

        document
            .getElementById("errorCard")
            ?.classList.remove("hidden");

    },

    /*------------------------------------------
      Text Helpers
    ------------------------------------------*/

    firstValue(value, fallback = "N/A") {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            return fallback;

        }

        return value;

    },

    joinArray(list = []) {

        if (!Array.isArray(list) || list.length === 0) {

            return "N/A";

        }

        return list.join("、");

    },

    /*------------------------------------------
      Pronunciation
    ------------------------------------------*/

    getPronunciation(entry) {

        if (!entry.phonetics) {

            return {

                ipa: "",

                audio: ""

            };

        }

        let ipa = "";

        let audio = "";

        for (const item of entry.phonetics) {

            if (!ipa && item.text) {

                ipa = item.text;

            }

            if (!audio && item.audio) {

                audio = item.audio;

            }

        }

        return {

            ipa,

            audio

        };

    },
    /*------------------------------------------
      Meanings
    ------------------------------------------*/

    getMainMeaning(entry) {

        if (
            !entry.meanings ||
            entry.meanings.length === 0
        ) {

            return null;

        }

        return entry.meanings[0];

    },

    getDefinitions(meaning) {

        if (
            !meaning ||
            !meaning.definitions
        ) {

            return [];

        }

        return meaning.definitions;

    },

    /*------------------------------------------
      URL
    ------------------------------------------*/

    openNewTab(url) {

        window.open(

            url,

            "_blank",

            "noopener,noreferrer"

        );

    },

    /*------------------------------------------
      Format
    ------------------------------------------*/

    capitalize(text = "") {

        if (!text) {

            return "";

        }

        return text.charAt(0).toUpperCase() +

            text.slice(1);

    },

    /*------------------------------------------
      Initial Loading
    ------------------------------------------*/

    async initialize() {

        await this.wait(700);

        this.hideLoading();

    }

};

/*==========================================================
 Auto Initialize
==========================================================*/

window.addEventListener(

    "load",

    () => {

        Core.initialize();

    }

);