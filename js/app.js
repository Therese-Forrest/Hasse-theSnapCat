// HÄMTA ELEMENT FRÅN HTML (referenser till DOM-element)
// Vi sparar pekare till de element vi ska jobba med i JavaScript.
const factButton = document.getElementById("factButton");   // knappen som hämtar kattfakta
const factText = document.getElementById("factText");       // rutan där faktan skrivs ut

const imageTypeSelect = document.getElementById("imageType"); // select-listan med kategorier + "random"
const imageButton = document.getElementById("imageButton");   // knappen som hämtar kattbild
const catImage = document.getElementById("catImage");         // <img> där kattbilden visas


// HJÄLPFUNKTION: startFade(element)
// Lägger på fade-in-animationen på ett element
function startFade(element) {
  // Ta bort fade-klassen om den redan finns
  element.classList.remove("fade");

  // Tvinga webbläsaren att "rita om" elementet (för att kunna köra animationen flera gånger)
  void element.offsetWidth;

  // Lägg till fade-klassen igen så att CSS-animationen körs
  element.classList.add("fade");
}


// FUNKTION: hamtaKattfakta()
// Hämtar en slumpad kattfakta från API:t catfact.ninja
// och skriver ut den i faktarutan
async function hamtaKattfakta() {
  // Visa tillfällig text medan vi väntar på API-svar
  factText.textContent = "Hämtar kattfakta...";

  try {
    // fetch skickar en HTTP-förfrågan till API:t
    const res = await fetch("https://catfact.ninja/fact?max_length=140");

    // Felhantering om API:t svarar med felkod (t.ex. 404 eller 500)
    if (!res.ok) {
      throw new Error("Något gick fel: " + res.status);
    }

    // Tolka svaret som JSON (vänta tills det är färdigt)
    const data = await res.json();

    // Skriv in själva faktatexten i <p id="factText">
    factText.textContent = data.fact;

    // Lägg på fade-effekt på den nya texten
    startFade(factText);
  } catch (error) {
    // Om något har gått fel (nätverk, API, osv.)
    console.error(error);
    // Visa ett användarvänligt felmeddelande i rutan
    factText.textContent = "Kunde inte hämta kattfakta just nu.";
  }
}


// FUNKTION: laddaKategorier()
// Hämtar alla kategorier från CATAAS och fyller select-listan
// Körs en gång när sidan laddas
async function laddaKategorier() {
  try {
    // Gör ett API-anrop till CATAAS för att hämta kategorier (t.ex. "boxes", "hats", "sleepy"...)
    const res = await fetch("https://cataas.com/api/categories");

    // Kontrollera att servern svarade OK, annars skickas felet till catch-blocket
    if (!res.ok) {
      throw new Error("Nätverksfel: " + res.status);
    }

    // Tolka svaret som JSON (detta blir en array med strängar)
    const categories = await res.json();

    // Loopar igenom alla kategorier som API:t skickar tillbaka
    categories.forEach((category) => {
      // Skapa ett nytt <option>-element till select-rutan
      const option = document.createElement("option");

      // Kategorinamnet (t.ex. "boxes") blir värdet som används i API-anropet senare
      option.value = category;

      // Samma namn visas i dropdown-menyn för användaren
      option.textContent = category;

      // Lägg in det nya <option>-elementet sist i <select>-listan
      imageTypeSelect.appendChild(option);
    });
  } catch (error) {
    // Om något går fel i try-blocket ovan hamnar vi här
    console.error("Kunde inte ladda kategorier", error);
    // Om det blir fel funkar fortfarande alternativet "Slumpad kattvän" eftersom det redan finns i HTML
  }
}


// FUNKTION: hamtaKattbild()
// Hämtar en kattbild från CATAAS.
// Om användaren har valt en kategori i select-listan använder vi den,
// annars hämtas en helt slumpad bild.
async function hamtaKattbild() {
  // Läs av vilket värde som är valt i select-rutan
  // "random" = ingen specifik kategori, bara en slumpad katt
  // Annars får vi ett kategorinamn, t.ex. "boxes"
  const valdKategori = imageTypeSelect.value;

  // Vi bygger upp vilken URL vi ska fråga baserat på valet
  let apiUrl;

  if (valdKategori === "random") {
    // Helt slumpad katt, men vi ber om JSON-svar först
    apiUrl = "https://cataas.com/cat?json=true";
  } else {
    // Slumpad katt inom en viss kategori, t.ex. /cat/boxes
    apiUrl = `https://cataas.com/cat/${valdKategori}?json=true`;
  }

  // Visa i alt-texten att någonting händer
  catImage.alt = "Hämtar bild...";

  try {
    // Hämta data (JSON) från CATAAS
    const res = await fetch(apiUrl);

    // Felhantering om API:t svarar med felkod
    if (!res.ok) {
      throw new Error("Nätverksfel: " + res.status);
    }

    // Väntar på att JSON-datan ska vara färdig (t.ex. { url: "/cat/abcd123" })
    const data = await res.json();

    // Säkerhetskoll: finns det verkligen en url i svaret?
    if (!data || !data.url) {
      throw new Error("Ingen bild hittades");
    }

    // Här bygger vi den fullständiga bild-URL:en
    // API:t ger t.ex. "/cat/abcd123", så vi lägger till domänen framför
    const imageUrl = "https://cataas.com" + data.url;

    // Vi skapar en temporär osynlig bild som byts ut när bilden är färdigladdad
    // (så att vi slipper blink/hopp när bilden byts)
    const tempImg = new Image();
    tempImg.src = imageUrl;

    // När bilden är helt färdigladdad:
    tempImg.onload = () => {
      // Byt bildkälla på den synliga <img id="catImage">
      catImage.src = imageUrl;

      // Gör en fade-effekt när den nya bilden visas
      startFade(catImage);
    };

    // Om själva bildladdningen misslyckas
    tempImg.onerror = () => {
      catImage.alt = "Kunde inte ladda bilden.";
    };
  } catch (error) {
    // Om API-anropet misslyckas, t.ex. ingen internetuppkoppling
    console.error(error);
    catImage.alt = "Kunde inte hämta bild.";
  }
}


// KOPPLA FUNKTIONERNA TILL KNAPPARNA
// (event-lyssnare på knapp-klick)
factButton.addEventListener("click", hamtaKattfakta); // kör hamtaKattfakta när man klickar på faktaknappen
imageButton.addEventListener("click", hamtaKattbild); // kör hamtaKattbild när man klickar på bildknappen


// INIT: körs en gång när sidan laddas
// fyller dropdown-listan med alla kategorier från CATAAS-API:t
laddaKategorier();
