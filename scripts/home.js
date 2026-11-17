const SPREADSHEET_ID = '1bliVSZrIA0-MXRBsVztA5woG7rAwuL4_Zoabst8NWSc';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;

let productosGlobales = []; // Variable global accesible para el buscador

async function cargarProductos() {
    try {
        const urlSinCache = `${CSV_URL}&t=${new Date().getTime()}`;
        const response = await fetch(urlSinCache);
        if (!response.ok) throw new Error('Error al conectar con Google Sheets');
        
        const csvText = await response.text();
        productosGlobales = parseCSV(csvText);
        renderizarProductos(productosGlobales);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('productosContainer').innerHTML = `
            <p style="text-align: center; color: red; width: 100%;">
                No se pudieron cargar los productos. Asegúrate de que la hoja de Google Sheets sea pública.
            </p>`;
    }
}

function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            let value = currentLine[j] ? currentLine[j].trim() : '';
            value = value.replace(/^"(.*)"$/, '$1');
            obj[headers[j]] = value;
        }
        result.push(obj);
    }
    return result;
}

function renderizarProductos(productos) {
    const container = document.getElementById('productosContainer');
    if (!container) return;
    
    container.innerHTML = '';

    if (productos.length === 0) {
        container.innerHTML = '<p style="text-align: center; width: 100%; padding: 20px;">No se encontraron productos.</p>';
        return;
    }

    productos.forEach(prod => {
        const nombre = prod.producto || prod.nombre || prod.titulo || 'Producto';
        const precio = prod.precio || prod.costo || '0';
        let imgUrl = prod.imagen ? prod.imagen.trim() : 'https://via.placeholder.com/300';

        const card = document.createElement('div');
        card.className = 'product-card';

        card.innerHTML = `
            <div class="product-img-container">
                <img src="${imgUrl}" alt="${nombre}" onerror="this.onerror=null; this.src='https://via.placeholder.com/300';">
            </div>
            <div class="product-info">
                <h3 class="product-title">${nombre}</h3>
                <p class="product-price">$${precio} MXN</p>
                <button class="btn-buy" style="margin-top: 8px; cursor: pointer;">Agregar al carrito</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Mover carrusel con las flechas
function scrollCarousel(direction) {
    const container = document.getElementById('productosContainer');
    const scrollAmount = 320;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// Bajar la página y centrar un producto específico en el carrusel
function enfocarProductoEnCarrusel(nombreBuscado) {
    const seccionProductos = document.querySelector('.productos-section');
    const container = document.getElementById('productosContainer');

    // 1. Baja suavemente hacia la sección de productos
    if (seccionProductos) {
        seccionProductos.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 2. Busca la tarjeta que coincida con el nombre (sin importar mayúsculas o acentos)
    const normalizar = str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const objetivo = normalizar(nombreBuscado);

    const tarjetas = container.querySelectorAll('.product-card');
    for (const card of tarjetas) {
        const titulo = card.querySelector('.product-title')?.textContent || '';
        
        if (normalizar(titulo).includes(objetivo)) {
            // Calcula la posición exacta para dejar la tarjeta centrada en el carrusel
            const posicionIzquierda = card.offsetLeft - (container.clientWidth / 2) + (card.clientWidth / 2);
            
            // Pequeña pausa para que se note el desplazamiento horizontal mientras baja
            setTimeout(() => {
                container.scrollTo({ left: posicionIzquierda, behavior: 'smooth' });
            }, 300);
            break;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();

    // Conectar el botón "¡LO QUIERO YA!"
    const btnCta = document.getElementById('btnLoQuieroYa');
    if (btnCta) {
        btnCta.addEventListener('click', (e) => {
            e.preventDefault();
            enfocarProductoEnCarrusel('Collar Corazón Verde y Perlas');
        });
    }
});