// HÄMTA ELEMENT FRÅN HTML (referenser till DOM-element)
// Vi sparar pekare till de element vi ska jobba med i JavaScript.
const factButton = document.getElementById("factButton");   // knappen som hämtar kattfakta
const factText = document.getElementById("factText");       // rutan där faktan skrivs ut

const imageTypeSelect = document.getElementById("imageType"); // select-listan med raser + "random"
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

    //felhantering om API:t svarar med felkod
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
    // om något har gått fel (nätverk, API, osv.)
    console.error(error);
    //felmeddelande visas
    factText.textContent = "Kunde inte hämta kattfakta just nu.";
  }
}

// FUNKTION: laddaKattraser()
// Hämtar alla kattraser från TheCatAPI och fyller select-listan
// Körs en gång när sidan laddas
async function laddaKattraser() {
  try {
    //gör ett API-anrop till TheCatAPI för att hämta kattraser
    const res = await fetch("https://api.thecatapi.com/v1/breeds");

    //kontrollera att servern svarade OK, annars skickas felet till catch-blocket
    if (!res.ok) {
      throw new Error("Nätverksfel: " + res.status);
    }

    //tolka svaret som JSON och vänta till det är klart
    const breeds = await res.json();

    //loopa igenom alla rasobjekt som API:t skickar tillbaka
    breeds.forEach((breed) => {
      //skapa ett nytt <option>-element till select-rutan
      const option = document.createElement("option");
      // rasens ID blir värdet på aktuellt option, vilket gör att API:t senare kan filtrera på rätt ras
      option.value = breed.id;
      // Namnet som visas i dropdown-menyn
      option.textContent = breed.name;
      //lägger in det nya <option>-elementet sist i <select>-listan
      imageTypeSelect.appendChild(option);
    });
  } catch (error) {
    //om något gåt fel i try-blocket ovan hamnar vi här
    console.error("Kunde inte ladda kattraser", error);
    // Om det blir fel funkar fortfarande alternativet "Slumpad kattvän" eftersom den redan fanns
  }
}

// FUNKTION: hamtaKattbild()
// Hämtar en kattbild från TheCatAPI.
// Om användaren har valt en ras i select-listan filtrerar vi på den,
// annars hämtas en helt slumpad bild.
async function hamtaKattbild() {
  // Läs av vilket värde som är valt i select-rutan
  // "random" = ingen specifik ras, bara en slumpad bild
  // Annars får vi ett ras-id.
  const valdRas = imageTypeSelect.value;

  // Bas-URL för API:t
  let url = "https://api.thecatapi.com/v1/images/search";

  // Om användaren inte valt Slumpad kattbild ("random")
  // dvs. hen har valt en viss ras, läggs den till som query-parameter
  if (valdRas !== "random") {
    url += ?breed_ids=${valdRas};
  }

  // Visa i alt-texten att någonting händer
  catImage.alt = "Hämtar bild...";

  try {
    //hämta data från API:t
    //fetch() skickar en förfrågan till TheCatAPI
    const res = await fetch(url);

    //felhantering om API:t svarar med felkod
    if (!res.ok) {
      throw new Error("Nätverksfel: " + res.status);
    }

    //väntar på att JSON-datan ska vara färdig
    const data = await res.json();

    // Säkerhetskoll: finns det verkligen en bild i svaret?
    if (!data[0] || !data[0].url) {
      throw new Error("Ingen bild hittades");
    }

    //Här är den riktiga bild-URL:en som ska visas
    const imageUrl = data[0].url;

    // Vi skapar en temporär osynlig bild som byts ut när bilden är färdigladdad
    // (så att vi slipper blink/hopp)
    const tempImg = new Image();
    tempImg.src = imageUrl;

    // När bilden är färdigladdad visas den på sidan
    tempImg.onload = () => {
      // Byt bildkälla på den synliga <img id="catImage">
      catImage.src = imageUrl;

      // Kör fade-effekten
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


// – fyll select-rutan med alla kattraser från API:t
// Körs en gång när sidan laddas
laddaKattraser();
