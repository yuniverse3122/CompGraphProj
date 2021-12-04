var pop = {
  pWrap : null,
  pTitle : null,
  ptxt : null,
  init : () => {
    pop.pWrap = document.createElement("div");
    pop.pWrap.id = "popwrap";
    document.body.appendChild(pop.pWrap);

    let pBox = document.createElement("div");
    pBox.id = "popbox";
    pop.pWrap.appendChild(pBox);

    pop.pTitle = document.createElement("h1");
    pop.pTitle.id = "poptitle";
    pBox.appendChild(pop.pTitle);

    pop.pText = document.createElement("p");
    pop.pText.id = "poptext";
    pBox.appendChild(pop.pText);

    let pClose = document.createElement("div");
    pClose.id = "popclose";
    pClose.innerHTML = "&#9746;";
    pClose.onclick = pop.close;
    pBox.appendChild(pClose);
  },

  open : (title, text) => {
    pop.pTitle.innerHTML = title;
    pop.pText.innerHTML = text;
    pop.pWrap.classList.add("open");
  },

  close : () => {
    pop.pWrap.classList.remove("open");
  }
};
window.addEventListener("DOMContentLoaded", pop.init);
