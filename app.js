/*==========================================================
 English Learning Assistant
 app.js
==========================================================*/

"use strict";

/*==========================================================
 DOM
==========================================================*/

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const historyContainer = document.getElementById("historyContainer");
const favoriteContainer = document.getElementById("favoriteContainer");

const resultType = document.getElementById("resultType");
const resultTitle = document.getElementById("resultTitle");
const resultContent = document.getElementById("resultContent");

const favoriteButton = document.getElementById("favoriteButton");

const clearHistoryButton = document.getElementById("clearHistoryButton");
const clearFavoriteButton = document.getElementById("clearFavoriteButton");

/*==========================================================
 Current State
==========================================================*/

let currentKeyword = "";
let currentAudio = "";

/*==========================================================
 Initial
==========================================================*/

window.addEventListener("load", () => {

    renderHistory();

    renderFavorite();

});

/*==========================================================
 Events
==========================================================*/

searchButton.addEventListener("click", startSearch);

searchInput.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        startSearch();

    }

});

favoriteButton.addEventListener("click", () => {

    if (!currentKeyword) return;

    Core.toggleFavorite(currentKeyword);

    updateFavoriteButton();

    renderFavorite();

});

clearHistoryButton.addEventListener("click", () => {

    Core.clearHistory();

    renderHistory();

});

clearFavoriteButton.addEventListener("click", () => {

    Core.clearFavorite();

    renderFavorite();

    updateFavoriteButton();

});

/*==========================================================
 Search
==========================================================*/

async function startSearch(keyword = "") {

    const text = keyword || searchInput.value.trim();

    if (!text) {

        return;

    }

    currentKeyword = text;

    searchInput.value = text;

    Core.showLoading();

    try {

        const type = Core.detectType(text);

        Core.saveHistory(text);

        renderHistory();

        if (type === "word") {

            await searchWord(text);

        }

        else if (type === "phrase") {

            await searchPhrase(text);

        }

        else {

            await searchGrammar(text);

        }

    }

    catch (error) {

        Core.showError(error.message);

    }

    finally {

        Core.hideLoading();

    }

}

/*==========================================================
 Word
==========================================================*/

async function searchWord(word) {

    const dictionary = await Core.fetchDictionary(word);

    const translation = await Core.fetchTranslation(word);

    const datamuse = await Core.fetchDatamuse(word);

    const entry = dictionary[0];

    const pronunciation = Core.getPronunciation(entry);

    currentAudio = pronunciation.audio;

    const kk = Core.ipaToKK(pronunciation.ipa);

    const meanings = entry.meanings || [];

    const primaryMeaning = meanings[0] || {};

    const definition =
    Core.getDefinitions(primaryMeaning)[0] || {};

    const chinese = translation.responseData?.translatedText || "查無資料";

    let exampleTranslation = "";

if (definition.example) {

    const exampleResult = await Core.fetchTranslation(
        definition.example
    );

    exampleTranslation =
        exampleResult.responseData?.translatedText || "查無翻譯";

}

    resultType.textContent = "📖 Word";

    resultTitle.textContent = entry.word;

    updateFavoriteButton();

    resultContent.innerHTML = `

<div class="info-card">
<h3>🔤 KK 音標</h3>
<p>${kk}</p>
</div>

<div class="info-card">
<h3>🔊 發音</h3>
<button onclick="Core.playAudio('${pronunciation.audio}')">
Play Pronunciation
</button>
</div>

<div class="info-card">
<h3>📝 詞性</h3>
<p>${primaryMeaning.partOfSpeech || "N/A"}</p>
</div>

<div class="info-card">
<h3>🇹🇼 中文</h3>
<p>${chinese}</p>
</div>

<div class="info-card">

<h3>📚 英文例句</h3>

<p>
${definition.example || "N/A"}
</p>

<br>

<h3>🇹🇼 中文翻譯</h3>

<p>
${exampleTranslation || "N/A"}
</p>

</div>

<div class="info-card">
<h3>🌱 常見搭配</h3>
<ul>

${datamuse.map(item=>`<li>${item.word}</li>`).join("")}

</ul>
</div>

<div class="info-card">
<h3>⭐ Yahoo Dictionary</h3>
<p>

<a
target="_blank"
href="${Core.buildYahooUrl(word)}">

Open Yahoo Dictionary

</a>

</p>
</div>

`;

    Core.showResultCard();

}

/*==========================================================
 Phrase
==========================================================*/

async function searchPhrase(phrase) {

    const translation = await Core.fetchTranslation(phrase);

    const datamuse = await Core.fetchDatamuse(phrase);

    const chinese = translation.responseData?.translatedText || "查無資料";

    resultType.textContent = "📖 Phrase";

    resultTitle.textContent = phrase;

    updateFavoriteButton();

    resultContent.innerHTML = `

<div class="info-card">
<h3>🔤 KK 音標</h3>
<p>需查證</p>
</div>

<div class="info-card">
<h3>🔊 發音</h3>
<p>Dictionary API 無提供完整片語發音。</p>
</div>

<div class="info-card">
<h3>📝 類型</h3>
<p>Phrase</p>
</div>

<div class="info-card">
<h3>📝 詞性</h3>
<p>依上下文決定</p>
</div>

<div class="info-card">
<h3>🇹🇼 中文</h3>
<p>${chinese}</p>
</div>

<div class="info-card">
<h3>📚 英文例句</h3>
<p>No example available.</p>
</div>

<div class="info-card">
<h3>🇹🇼 中文例句</h3>
<p>需查證</p>
</div>

<div class="info-card">
<h3>🧩 拆解說明</h3>
<p>此片語由多個英文單字組成，實際意思需依整體語意理解，而非逐字翻譯。</p>
</div>

<div class="info-card">
<h3>🌱 常見搭配</h3>
<ul>
${datamuse.map(item => `<li>${item.word}</li>`).join("")}
</ul>
</div>

<div class="info-card">
<h3>⭐ Yahoo Dictionary</h3>
<p>
<a
target="_blank"
href="${Core.buildYahooUrl(phrase)}">
Open Yahoo Dictionary
</a>
</p>
</div>

`;

    Core.showResultCard();

}

/*==========================================================
 Grammar
==========================================================*/

async function searchGrammar(grammar) {

    const translation = await Core.fetchTranslation(grammar);

    const chinese = translation.responseData?.translatedText || "查無資料";

    resultType.textContent = "📖 Grammar";

    resultTitle.textContent = grammar;

    updateFavoriteButton();

    resultContent.innerHTML = `

<div class="info-card">
<h3>📖 文法名稱</h3>
<p>${grammar}</p>
</div>

<div class="info-card">
<h3>📚 用法</h3>
<p>請依英文文法規則理解此句型。</p>
</div>

<div class="info-card">
<h3>📚 英文例句</h3>
<p>${grammar}</p>
</div>

<div class="info-card">
<h3>🇹🇼 中文</h3>
<p>${chinese}</p>
</div>

<div class="info-card">
<h3>🔄 變化</h3>
<p>依時態、主詞及語境調整。</p>
</div>

<div class="info-card">
<h3>⚠️ 常見錯誤</h3>
<p>避免逐字翻譯，請依完整文法結構理解。</p>
</div>

<div class="info-card">
<h3>⭐ Yahoo Dictionary</h3>
<p>
<a
target="_blank"
href="${Core.buildYahooUrl(grammar)}">
Open Yahoo Dictionary
</a>
</p>
</div>

`;

    Core.showResultCard();

}


/*==========================================================
 History
==========================================================*/

function renderHistory() {

    historyContainer.innerHTML = "";

    const history = Core.getHistory();

    history.forEach(item => {

        const tag = document.createElement("div");

        tag.className = "tag-item";

        tag.textContent = item;

        tag.addEventListener("click", () => {

            startSearch(item);

        });

        historyContainer.appendChild(tag);

    });

}

/*==========================================================
 Favorite
==========================================================*/

function renderFavorite() {

    favoriteContainer.innerHTML = "";

    const favorite = Core.getFavorite();

    favorite.forEach(item => {

        const tag = document.createElement("div");

        tag.className = "tag-item";

        tag.textContent = item;

        tag.addEventListener("click", () => {

            startSearch(item);

        });

        favoriteContainer.appendChild(tag);

    });

}

/*==========================================================
 Favorite Button
==========================================================*/

function updateFavoriteButton() {

    if (!currentKeyword) {

        favoriteButton.textContent = "♡";

        return;

    }

    favoriteButton.textContent = Core.isFavorite(currentKeyword)

        ? "❤️"

        : "♡";

}

/*==========================================================
 Initialize
==========================================================*/

updateFavoriteButton();