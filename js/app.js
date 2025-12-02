// Element från HTML
const select = document.getElementById("valjTyp");
const generateBtn = document.getElementById("hamtaknapp");
const resultText = document.getElementById("FaktaText");
const resultImage = document.getElementById("KattBild");

// --- Funktion: hämta kattfakta ---
async function hamtaKattfakta() {
  // Visa text, göm bild
  resultImage.style.display = "none";
  resultText.style.display = "block";
  resultText.textContent = "Hämtar kattfakta...";

  try {
    const res = await fetch("https://catfact.ninja/fact?max_length=140");
    const data = await res.json();
    resultText.textContent = data.fact;

    // RESETTA ANIMATIONEN
    resultText.classList.remove("fade");
    void resultText.offsetWidth;
    // LÄGG TILL ANIMATIONEN
    resultText.classList.add("fade");

  } catch (error) {
    resultText.textContent = "Kunde inte hämta fakta.";
  }
}

// --- Funktion: hämta kattbild ---
async function hamtaKattbild() {
  // Visa text som "laddar", göm bild tills vi har en
  resultText.style.display = "block";
  resultImage.style.display = "none";
  resultText.textContent = "Hämtar bild...";

  try {
    const res = await fetch("https://api.thecatapi.com/v1/images/search");
    const data = await res.json();
    const url = data[0].url;

    // När bilden laddats klart ska fade-effekten köras på den NYA bilden
    resultImage.onload = () => {
      resultText.textContent = "";
      resultText.style.display = "none";

      // resetta animationen
      resultImage.classList.remove("fade");
      void resultImage.offsetWidth;
      resultImage.classList.add("fade");

      resultImage.style.display = "block";
    };

    // Sätt src sist (detta startar laddningen)
    resultImage.src = url;

  } catch (error) {
    resultText.textContent = "Kunde inte hämta bild.";
    resultText.style.display = "block";
  }
}



// --- När man klickar på knappen ---
generateBtn.addEventListener("click", () => {
  const val = select.value;

  if (val === "fact") {
    hamtaKattfakta();
  } else if (val === "image") {
    hamtaKattbild();
  }
});
