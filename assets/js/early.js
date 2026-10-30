/* Marca la página como "con JavaScript" antes de pintar, para las animaciones de entrada.
   Si main.js no llega a cargar, se quita a los 2,5 s y todo queda visible. */
document.documentElement.classList.add("js");
setTimeout(function () { if (!window.mmReady) document.documentElement.classList.remove("js"); }, 2500);
