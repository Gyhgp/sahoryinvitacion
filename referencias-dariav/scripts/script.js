document.addEventListener("DOMContentLoaded", function () {
  
    //   Archivo de audio
    var audio = document.getElementById("audio");
    if (audio) {
        audio.volume = 0.3;
    } else {
        console.error("No se encontró el elemento de audio.");
    }

    
    //  Creacion de cronometro
    function crearCountdown(){
        var targetDate = new Date("2024-07-20T17:30:00");
        var currentDate = new Date();
        var diferencia = targetDate - currentDate;

        var days = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        var hour = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minu = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        var seco = Math.floor((diferencia % (1000 * 60)) / 1000);


        document.getElementById("dia").innerText = days;
        document.getElementById("hor").innerText = hour;
        document.getElementById("min").innerText = minu;
        document.getElementById("seg").innerText = seco;
        
    }

    setInterval(crearCountdown, 1000);
    crearCountdown();

    function isElementInViewport(el) {
        var rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function muestraLi(){
        var items = document.querySelectorAll(".timeline li");
        items.forEach(function (item) {
            if(isElementInViewport(item)){
                item.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', function(){
        muestraLi();
    });

    muestraLi();

    var hoy = new Date();
    var anio = hoy.getFullYear();
    document.getElementById("anio").innerText = anio;
});
