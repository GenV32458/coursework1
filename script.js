const translations = {
    luganda: {
        "hello": "Oli otya", "good morning": "Wasuze otya nno", "good afternoon": "Osiibye otya nno",
        "good evening": "Osiibye otya nno", "good night": "Sula bulungi", "how are you": "Oli otya?",
        "i am fine": "Ndi bulungi", "what is your name": "Erinnya lyo ggwe ani?", "my name is": "Erinnya lyange nze",
        "thank you": "Webale", "thank you very much": "Webale nnyo", "you are welcome": "Kale",
        "please": "Nsaba", "sorry": "Nsonyiwa", "excuse me": "Nsonyiwa", "yes": "Yee", "no": "Nedda",
        "goodbye": "Weeraba", "see you later": "Tujja kulabagana", "i love you": "Nkwagala",
        "welcome": "Tukusanyukidde", "where are you going": "Ogenda wa?", "where do you live": "Obeera wa?",
        "where can i find you": "Nsobola okukusanga wa?", "where is the school": "Essomero liri wa?",
        "where is the bathroom": "Akasenge k'ekinaabiro kali wa?", "where can i find a taxi": "Nsobola okusanga takisi wa?",
        "i do not understand": "Sitegeera", "do you speak english": "Oyogera Olungereza?", "help me": "Nnyamba",
        "how much is this": "Kino kya ssente mmeka?", "water": "Amazzi", "food": "Emmere",
        "friend": "Mukwano", "school": "Essomero", "teacher": "Omusomesa", "student": "Omuyizi",
        "book": "Ekitabo", "home": "Awaka", "mother": "Maama", "father": "Taata", "child": "Omwana",
        "today": "Leero", "tomorrow": "Enkya", "beautiful": "Kirungi", "good": "Bulungi", "come": "Jangu"
    },
    french: {
        "hello": "Bonjour", "good morning": "Bonjour", "good afternoon": "Bon après-midi",
        "good evening": "Bonsoir", "good night": "Bonne nuit", "how are you": "Comment allez-vous ?",
        "i am fine": "Je vais bien", "what is your name": "Comment vous appelez-vous ?", "my name is": "Je m’appelle",
        "thank you": "Merci", "thank you very much": "Merci beaucoup", "you are welcome": "De rien",
        "please": "S’il vous plaît", "sorry": "Désolé", "excuse me": "Excusez-moi", "yes": "Oui", "no": "Non",
        "goodbye": "Au revoir", "see you later": "À plus tard", "i love you": "Je t’aime", "welcome": "Bienvenue",
        "where are you going": "Où allez-vous ?", "where do you live": "Où habitez-vous ?",
        "where can i find you": "Où puis-je vous trouver ?", "where is the school": "Où est l’école ?",
        "where is the bathroom": "Où sont les toilettes ?", "where can i find a taxi": "Où puis-je trouver un taxi ?",
        "i do not understand": "Je ne comprends pas", "do you speak english": "Parlez-vous anglais ?",
        "help me": "Aidez-moi", "how much is this": "Combien ça coûte ?", "water": "Eau", "food": "Nourriture",
        "friend": "Ami", "school": "École", "teacher": "Professeur", "student": "Étudiant", "book": "Livre",
        "home": "Maison", "mother": "Mère", "father": "Père", "child": "Enfant", "today": "Aujourd’hui",
        "tomorrow": "Demain", "beautiful": "Beau", "good": "Bon", "come": "Venez"
    }
};

const languageDetails = {
    luganda: { name: "Luganda", code: "LG" },
    french: { name: "French", code: "FR" }
};

const sourceText = document.querySelector("#source-text");
const translatedText = document.querySelector("#translated-text");
const targetLanguage = document.querySelector("#target-language");
const characterCount = document.querySelector("#character-count");
const status = document.querySelector("#translation-status");
const translationCache = new Map();

function normalise(text) {
    return text.toLowerCase().trim().replace(/[.!?,;:]+$/g, "").replace(/\s+/g, " ");
}

async function translate() {
    const original = sourceText.value.trim();
    if (!original) {
        translatedText.innerHTML = '<span class="placeholder">Your translation will appear here.</span>';
        status.textContent = "Ready";
        return;
    }

    const dictionary = translations[targetLanguage.value];
    const key = normalise(original);
    let result = dictionary[key];

    if (result) {
        status.textContent = "Translated";
        translatedText.textContent = result;
        return;
    }

    const cacheKey = `${targetLanguage.value}:${key}`;
    if (translationCache.has(cacheKey)) {
        translatedText.textContent = translationCache.get(cacheKey);
        status.textContent = "Translated";
        return;
    }

    status.textContent = "Translating…";
    translatedText.textContent = "Translating-------";

    try {
        const response = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: original, target: targetLanguage.value })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Translation failed");
        translationCache.set(cacheKey, data.translation);
        translatedText.textContent = data.translation;
        status.textContent = "Translated online";
    } catch (error) {
        const words = key.split(" ");
        const converted = words.map(word => dictionary[word] || word);
        const matchedWords = converted.filter((word, index) => word !== words[index]).length;
        if (matchedWords) {
            translatedText.textContent = converted.join(" ");
            status.textContent = "Partial offline match";
        } else {
            translatedText.textContent = "Online translation is not configured. Start the local server and add your Fasiri API key.";
            status.textContent = "Setup needed";
        }
    }
}

function updateLanguage() {
    const details = languageDetails[targetLanguage.value];
    document.querySelector("#target-code").textContent = details.code;
    document.querySelector("#output-label").textContent = `${details.name} translation`;
    if (sourceText.value.trim()) translate();
}

sourceText.addEventListener("input", () => {
    characterCount.textContent = `${sourceText.value.length} / 500`;
    if (!sourceText.value) translate();
});

sourceText.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") translate();
});

targetLanguage.addEventListener("change", updateLanguage);
document.querySelector("#translate-button").addEventListener("click", translate);

document.querySelector("#clear-button").addEventListener("click", () => {
    sourceText.value = "";
    characterCount.textContent = "0 / 500";
    translate();
    sourceText.focus();
});

document.querySelector("#copy-button").addEventListener("click", async () => {
    if (!translatedText.textContent || translatedText.querySelector(".placeholder")) return;
    try {
        await navigator.clipboard.writeText(translatedText.textContent);
        status.textContent = "Copied!";
        setTimeout(() => { status.textContent = "Translated"; }, 1300);
    } catch {
        status.textContent = "Select and copy";
    }
});

document.querySelectorAll(".example-card").forEach(button => {
    button.addEventListener("click", () => {
        sourceText.value = button.dataset.phrase;
        characterCount.textContent = `${sourceText.value.length} / 500`;
        translate();
        document.querySelector(".translator-card").scrollIntoView({ behavior: "smooth", block: "center" });
    });
});
