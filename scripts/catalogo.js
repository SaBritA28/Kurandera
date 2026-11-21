const SPREADSHEET_ID = '1bliVSZrIA0-MXRBsVztA5woG7rAwuL4_Zoabst8NWSc';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;

// Variable global accesible para el buscador y otras vistas
window.productosGlobales = [];

async function cargarProductos() {
    try {
        const urlSinCache = `${CSV_URL}&t=${new Date().getTime()}`;
        const response = await fetch(urlSinCache);
        
        if (!response.ok) throw new Error('Error al conectar con Google Sheets');
        
        const csvText = await response.text();
        window.productosGlobales = parseCSV(csvText);
        
        console.log("Productos parseados:", window.productosGlobales);
        renderizarProductos(window.productosGlobales);
    } catch (error) {
        console.error('Error al sincronizar los productos:', error);
        const container = document.getElementById('productosContainer');
        if (container) {
            container.innerHTML = `
                <p style="text-align: center; color: red; grid-column: 1/-1;">
                    Hubo un error al cargar los productos. Verifica que la hoja sea pública.
                </p>`;
        }
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

    if (!productos || productos.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; width: 100%;">No hay productos disponibles.</p>';
        return;
    }

    productos.forEach(prod => {
        if (!prod.producto && !prod.nombre && !prod.titulo) return;

        const nombreProd = prod.producto || prod.nombre || prod.titulo || 'Producto';
        const precioProd = prod.precio || prod.costo || '0';

        let imagenSrc = prod.imagen ? prod.imagen.trim().replace(/['"]+/g, '') : '';
        
        if (!imagenSrc || (!imagenSrc.startsWith('http://') && !imagenSrc.startsWith('https://'))) {
            imagenSrc = 'https://via.placeholder.com/300?text=Kurandera';
        }

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-container">
                <img alt="">
            </div>
            <div class="product-info">
                <h3 class="product-title"></h3>
                <p class="product-price"></p>
                <button class="btn-buy agregar-carrito" style="margin-top: 6px; cursor: pointer;">Agregar al carrito</button>
            </div>
        `;
        const imagen = card.querySelector('img');
        imagen.src = imagenSrc;
        imagen.alt = nombreProd;
        imagen.addEventListener('error', () => {
            imagen.src = 'https://via.placeholder.com/300?text=Error+de+Imagen';
        }, { once: true });
        card.querySelector('.product-title').textContent = nombreProd;
        card.querySelector('.product-price').textContent = `$${precioProd} MXN`;
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});