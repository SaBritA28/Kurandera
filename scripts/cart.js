// ==========================================================================
// LÓGICA DE KURANDERA - CARRITO Y FOOTER WHATSAPP
// ==========================================================================

let carrito = JSON.parse(localStorage.getItem('kurandera_carrito')) || [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. INYECCIÓN DEL CARRITO FLOTANTE Y MODAL
    const estructuraCarritoHTML = `
        <div id="cartFloatingBtn" class="cart-floating-btn" style="display: none;">
            <svg viewBox="0 0 24 24"><path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>
            <span id="cartBadge" class="cart-badge">0</span>
        </div>

        <div id="cartModal" class="cart-modal">
            <div class="cart-header">
                <h3>Tu Carrito de Compras</h3>
                <button id="cartCloseBtn" class="cart-close-btn">&times;</button>
            </div>
            <div id="cartBody" class="cart-body">
                <p style="text-align: center; color: #888;">Tu carrito está vacío</p>
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total:</span>
                    <span id="cartTotalPrice">$0 MXN</span>
                </div>
                <button id="btnCheckoutWhatsApp" class="btn-whatsapp-pay">
                    Pagar por WhatsApp
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', estructuraCarritoHTML);

    const floatingBtn = document.getElementById('cartFloatingBtn');
    const cartModal = document.getElementById('cartModal');
    const closeBtn = document.getElementById('cartCloseBtn');
    const cartBody = document.getElementById('cartBody');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const btnCheckoutWhatsApp = document.getElementById('btnCheckoutWhatsApp');

    const abrirCarrito = () => cartModal.classList.add('active');
    const cerrarCarrito = () => cartModal.classList.remove('active');

    if (floatingBtn) floatingBtn.addEventListener('click', abrirCarrito);
    if (closeBtn) closeBtn.addEventListener('click', cerrarCarrito);

    document.addEventListener('click', (e) => {
        const selectorBolsa = e.target.closest('.fa-shopping-bag') || 
                              e.target.closest('.fa-bag-shopping') || 
                              e.target.closest('a[href*="cart"]') || 
                              e.target.closest('a[href*="bolsa"]') || 
                              e.target.closest('.cart-icon') ||
                              e.target.closest('svg');

        if (selectorBolsa && (selectorBolsa.closest('header') || selectorBolsa.closest('.nav') || selectorBolsa.closest('nav'))) {
            e.preventDefault();
            abrirCarrito();
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-buy') || e.target.classList.contains('agregar-carrito')) {
            const card = e.target.closest('.product-card');
            if (!card) return;

            const titulo = card.querySelector('.product-title')?.textContent || 'Producto';
            const precioTexto = card.querySelector('.product-price')?.textContent || '$0';
            const imagen = card.querySelector('img')?.src || '';
            const precio = parseFloat(precioTexto.replace(/[^0-9.]/g, '')) || 0;

            agregarAlCarrito(titulo, precio, imagen);
        }
    });

    function agregarAlCarrito(titulo, precio, imagen) {
        const productoExistente = carrito.find(item => item.titulo === titulo);
        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            carrito.push({ titulo, precio, imagen, cantidad: 1 });
        }
        guardarYActualizar();
        abrirCarrito();
    }

    function guardarYActualizar() {
        localStorage.setItem('kurandera_carrito', JSON.stringify(carrito));
        actualizarCarritoUI();
    }

    function actualizarCarritoUI() {
        if (!cartBody || !cartBadge || !cartTotalPrice || !floatingBtn) return;

        if (carrito.length === 0) {
            floatingBtn.style.display = 'none';
            cartBody.innerHTML = '<p style="text-align: center; color: #888; margin-top: 40px;">Tu carrito está vacío</p>';
            cartBadge.textContent = '0';
            cartTotalPrice.textContent = '$0 MXN';
            return;
        }

        floatingBtn.style.display = 'flex';
        let totalPzs = 0;
        let sumaTotal = 0;
        let htmlItems = '';

        carrito.forEach((item, index) => {
            totalPzs += item.cantidad;
            sumaTotal += item.precio * item.cantidad;
            htmlItems += `
                <div class="cart-item">
                    <img src="${item.imagen}" alt="${item.titulo}">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.titulo}</div>
                        <div class="cart-item-price">$${item.precio} MXN</div>
                        <div class="cart-item-controls">
                            <button onclick="cambiarCantidad(${index}, -1)">-</button>
                            <span>${item.cantidad}</span>
                            <button onclick="cambiarCantidad(${index}, 1)">+</button>
                        </div>
                    </div>
                </div>
            `;
        });

        cartBadge.textContent = totalPzs;
        cartBody.innerHTML = htmlItems;
        cartTotalPrice.textContent = `$${sumaTotal} MXN`;
    }

    window.cambiarCantidad = function(index, cambio) {
        carrito[index].cantidad += cambio;
        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }
        guardarYActualizar();
    };

    if (btnCheckoutWhatsApp) {
        btnCheckoutWhatsApp.addEventListener('click', () => {
            if (carrito.length === 0) return;
            let textoLista = "";
            let totalGeneral = 0;

            carrito.forEach(item => {
                let subtotal = item.precio * item.cantidad;
                totalGeneral += subtotal;
                textoLista += `${item.cantidad}x ${item.titulo} - $${subtotal} MXN\n`;
            });

            const mensajeFinal = `¡Hola! Me gustaría realizar el siguiente pedido en Kurandera:\n${textoLista}\nCon un total de $${totalGeneral} MXN\n¿Cuáles son los métodos de pago disponibles y el proceso de entrega?`;
            const numeroWhatsApp = "5212222933023";
            window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeFinal)}`, '_blank');
        });
    }

    actualizarCarritoUI();
});

// 2. FUNCIÓN GLOBAL INDEPENDIENTE PARA EL FOOTER (EVITA QUE EL BOTÓN FALLE)
document.addEventListener('click', function(e) {
    const btn = e.target.closest('#btnEnviarFooter');
    if (!btn) return;
    
    e.preventDefault();
    const input = document.getElementById('newsletter-input');
    if (!input) return;

    const texto = input.value.trim();
    if (texto === "") return;

    const numeroWhatsApp = "5212222933023";
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;
    
    window.open(url, '_blank');
    input.value = '';
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        const input = document.getElementById('newsletter-input');
        if (document.activeElement === input) {
            e.preventDefault();
            const texto = input.value.trim();
            if (texto === "") return;

            const numeroWhatsApp = "5212222933023";
            const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;
            
            window.open(url, '_blank');
            input.value = '';
        }
    }
});s