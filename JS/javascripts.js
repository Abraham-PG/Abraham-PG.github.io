
document.addEventListener("DOMContentLoaded", function () {
    const enlaces = document.querySelectorAll('.menu-urgente .nav-link');

    enlaces.forEach(enlace => {
        enlace.addEventListener('click', function (e) {
            e.preventDefault();

            // Resalta el enlace seleccionado y desactiva los demás
            enlaces.forEach(link => link.classList.remove('active'));
            this.classList.add('active');

            // Selecciona la sección a mostrar basándose en el atributo href del enlace
            const seccionId = this.getAttribute('href');
            const seccion = document.querySelector(seccionId);

            // Oculta todas las secciones de contenido, excepto el menú
            document.querySelectorAll('.contenido-sombreado > div:not(.menu-urgente)').forEach(div => {
                div.style.display = 'none';
            });

            // Muestra solo la sección seleccionada
            seccion.style.display = 'block';

        });

    });
    obtenerDatosBúsquedas();

    const campoBusqueda = document.getElementById('campoBusqueda');

    campoBusqueda.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault(); 
            buscar(); 
        }
    });

});

let informacion = [];
document.addEventListener("DOMContentLoaded", function () {
    fetch('/JSON/informacion.json')
        .then(response => response.json())
        .then(data => {
            informacion = data;
        })
        .catch(error => {
            console.error('Error al cargar la información:', error);
        });
});


function contraerMenu() {
    var menu = document.getElementById('navbarNav');
    var navbarToggler = document.querySelector('.navbar-toggler');
    if (menu.classList.contains('show')) {
        $(menu).collapse('hide');
        navbarToggler.classList.add('collapsed');
        navbarToggler.setAttribute('aria-expanded', 'false');
    }
}
function contraMenu() {
    var menu = document.getElementById('navbarNav');
    var navbarToggler = document.querySelector('.navbar-toggler');

    if (menu.classList.contains('show')) {
        navbarToggler.click();
    }
}
document.addEventListener('click', function(event) {
    var menu = document.getElementById('navbarNav');

    if (!menu.contains(event.target)) {
        contraMenu();
    }
});


var consultaAnterior = ''; 
var resultadosPorPagina = 5; 

function buscar() {

    var input = document.getElementById('campoBusqueda');
    var filter = input.value.toUpperCase();
    var resultadosBusqueda = document.getElementById('resultadosBusqueda');

    var palabrasExcluidas = ['Y', 'LOS', 'LAS', 'EL', 'LA', 'UN', 'UNA', 'EN', 'DE', 'CON', 'POR', 'PARA', 'ES', 'COMO', 'AL'];

    if (!filter.trim() || filter === consultaAnterior || palabrasExcluidas.includes(filter.trim())) {
        return; 
    }

    consultaAnterior = filter;
    resultadosBusqueda.innerHTML = '';
    resultadosBusqueda.style.display = 'block';

    campoBusqueda.value = '';

    if (campoBusqueda.classList.contains('expandir')) {
        campoBusqueda.classList.remove('expandir');
    }
    
    contraerMenu();

    var resultados = informacion.filter(item => {
        return item.titulo.toUpperCase().includes(filter) && !item.etiquetas.toUpperCase().includes("EXCLUIR");
    });

   
    if (resultados.length) {
        contraerMenu();
    }
    if (resultados.length) {
        registrarBusqueda(filter); 
        resultadosBusqueda.innerHTML = ''; 

        for (let i = 0; i < resultados.length; i += resultadosPorPagina) {
            var pagina = document.createElement('div');
            pagina.className = 'pagina';
            pagina.id = 'pagina-' + Math.ceil((i / resultadosPorPagina) + 1);

            for (let j = i; j < i + resultadosPorPagina && j < resultados.length; j++) {
                var bloque = document.createElement('div');
                bloque.className = 'bloque-contenido';

                var titulo = document.createElement('h3');
                titulo.textContent = resultados[j].titulo;
                bloque.appendChild(titulo);

                if (resultados[j].etiquetas) {
                    var etiquetas = document.createElement('p');
                    etiquetas.className = 'etiquetas';
                    etiquetas.textContent = 'Etiquetas: ' + resultados[j].etiquetas;
                    bloque.appendChild(etiquetas);
                }

                if (resultados[j].contenido) {
                    resultados[j].contenido.forEach(function (contenido) {
                        var subtema = document.createElement('p');
                        subtema.textContent = contenido.subtema;
                        subtema.classList.add('subtema');
                        if (contenido.resaltarSubtema) {
                            subtema.classList.add('subtema-resaltado');
                        }
                        bloque.appendChild(subtema);
                
                        contenido.texto.forEach(function (itemTexto) {
                            var parrafo = document.createElement('p');
                
                            if (itemTexto.frase) {
                                parrafo.innerHTML = itemTexto.frase;
                                if (itemTexto.resaltar) {
                                    parrafo.classList.add('texto-resaltado');
                                }
                            } else {
                                parrafo.textContent = itemTexto;
                            }
                
                            bloque.appendChild(parrafo);
                        });
                    });
                }
                pagina.appendChild(bloque);
                
                

            }

            resultadosBusqueda.appendChild(pagina);
        }

        crearControlesPaginacion(Math.ceil(resultados.length / resultadosPorPagina));
        mostrarPagina(1);
    } else {
        resultadosBusqueda.innerHTML = "<p>No se encontraron resultados.</p>";
    }




   
    var secciones = document.querySelectorAll('.contenido-sombreado > div:not(.menu-urgente)');
    secciones.forEach(function (seccion) {
        seccion.style.display = 'none';

    });

    // Muestra la paginación y activa la opción "Resultados de Búsqueda" en el menú.
    document.getElementById('contenedorPaginacion').style.display = 'block';
    var enlacesMenu = document.querySelectorAll('.menu-urgente .nav-link');
    enlacesMenu.forEach(enlace => enlace.classList.remove('active'));
    document.querySelector('.menu-urgente .nav-link[href="#resultadosBusqueda"]').classList.add('active');

    // Asegura que la sección de resultados esté visible u oculta según si hay resultados o no.
    resultadosBusqueda.style.display = resultadosBusqueda.children.length ? 'block' : 'none';
    animarScroll(0, 500); 


}

function registrarBusqueda(termino) {
    var busquedasRef = firebase.firestore().collection("busquedas");
    busquedasRef.where("termino", "==", termino).get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                return busquedasRef.add({ termino: termino, contador: 1 });
            } else {
                querySnapshot.forEach((doc) => {
                    var docRef = busquedasRef.doc(doc.id);
                    docRef.update({ contador: firebase.firestore.FieldValue.increment(1) });
                });
            }
        })
        .catch((error) => {
            console.error("Error al registrar búsqueda: ", error);
        });
}


function crearControlesPaginacion(numPaginas) {
    var contenedorPaginacion = document.getElementById('contenedorPaginacion');
    contenedorPaginacion.innerHTML = '';

    var tituloPaginacion = document.createElement('div');
    tituloPaginacion.className = 'titulo-paginacion';
    tituloPaginacion.innerHTML = '<h4>Navegar por Páginas</h4>';
    contenedorPaginacion.appendChild(tituloPaginacion);

    for (let i = 1; i <= numPaginas; i++) {
        var boton = document.createElement('button');
        boton.innerText = i;

        boton.style.background = 'linear-gradient(45deg, #687ac2, #58b7e7)';
        boton.style.color = 'white';
        boton.style.border = 'none';
        boton.style.padding = '10px 20px';
        boton.style.margin = '5px';
        boton.style.borderRadius = '30px';
        boton.style.fontWeight = 'bold';
        boton.style.textTransform = 'uppercase';
        boton.style.letterSpacing = '1px';
        boton.style.transition = 'all 0.3s ease';

        boton.onmouseover = function () {
            this.style.boxShadow = '0 10px 20px -5px rgba(110, 72, 170, 0.5)';
        };
        boton.onmouseout = function () {
            this.style.boxShadow = 'none';
        };

        boton.onclick = function () {
            mostrarPagina(i);
            animarScroll(0, 500); 
        };
        contenedorPaginacion.appendChild(boton);
    }
}

function mostrarPagina(numPagina) {
    var paginas = document.querySelectorAll('.pagina');
    paginas.forEach(pagina => pagina.style.display = 'none');
    document.getElementById('pagina-' + numPagina).style.display = 'block';
}

function cambiarPagina(seccion, numero) {
    var paginas = document.getElementsByClassName('pagina-' + seccion);
    for (var i = 0; i < paginas.length; i++) {
        paginas[i].style.display = 'none';
    }

    document.getElementsByClassName('pagina-' + seccion)[numero - 1].style.display = 'block';

    animarScroll(0, 500); 
}

function animarScroll(destino, duracion) {
    var inicio = window.scrollY;
    var distancia = destino - inicio;
    var inicioTiempo = null;

    function animacionScroll(momentoActual) {
        if (inicioTiempo === null) inicioTiempo = momentoActual;
        var tiempoPasado = momentoActual - inicioTiempo;
        var progreso = Math.min(tiempoPasado / duracion, 1);

        window.scrollTo(0, inicio + distancia * progreso);

        if (tiempoPasado < duracion) {
            requestAnimationFrame(animacionScroll);
        }
    }

    requestAnimationFrame(animacionScroll);
}

document.querySelector('.btn-busqueda').addEventListener('click', function () {
    var campo = document.getElementById('campoBusqueda');
    campo.classList.toggle('expandir');
    buscar(); 

});


function obtenerDatosBúsquedas() {
    var busquedasRef = firebase.firestore().collection("busquedas");
    busquedasRef.get().then((querySnapshot) => {
        var datos = [];

        querySnapshot.forEach((doc) => {
            datos.push({
                termino: doc.data().termino,
                contador: doc.data().contador
            });
        });

       
        datos.sort((a, b) => b.contador - a.contador);
        var datosTop5 = datos.slice(0, 5); 

     
        var terminosTop5 = datosTop5.map(item => item.termino);
        var conteosTop5 = datosTop5.map(item => item.contador);

        generarGrafico({ terminos: terminosTop5, conteos: conteosTop5 });
    }).catch((error) => {
        console.error("Error al obtener datos: ", error);
    });
}


function generarGrafico(datos) {
    var ctx = document.getElementById('graficoBarras').getContext('2d');
    var miGraficoMixto = new Chart(ctx, {
        type: 'bar', 
        data: {
            labels: datos.terminos,
            datasets: [{
                label: 'Búsquedas (Barras)',
                data: datos.conteos,
                type: 'bar', 
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }, {
                label: 'Búsquedas (Línea)',
                data: datos.conteos,
                type: 'line', 
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            scales: {
                xAxes: [{
                  ticks: {
                    autoSkip: true,
                    maxRotation: 50,
                    minRotation: 0
                  }
                }],
                yAxes: [{
                  ticks: {
                    beginAtZero: true 
                  }
                }]
              },
            layout: {
                padding: {
                    top: 15,
                    right: 25,
                    bottom: 15,
                    left: 25
                }
            },
            animation: {
                duration: 1000, 
                easing: 'easeOutBounce', 
                onProgress: function (animation) {
                    
                },
                onComplete: function () {
                   
                }
            }
        }
    });
}


var mybutton = document.getElementById("myBtn");
window.onscroll = function () {
    scrollFunction();
};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
        setTimeout(function () { mybutton.classList.add("show"); }, 10);
    } else {
        mybutton.classList.remove("show");
        setTimeout(function () { mybutton.style.display = "none"; }, 500);
    }
}

mybutton.addEventListener('click', function () {
    animarScroll(0, 500); 
});