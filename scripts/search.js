// ==========================================================================
// BUSCADOR EN VIVO Y CONTROL DE BANNER - KURANDERA
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Delegación de eventos para capturar la escritura en el input de búsqueda
    document.addEventListener('input', (e) => {
        if (e.target && e.target.id === 'searchInput') {
            const query = e.target.value.toLowerCase().trim();
            const bannerSection = document.querySelector('.hero-section') || document.querySelector('.banner-section') || document.querySelector('header + section');
            
            // Si el usuario escribe algo, ocultamos el banner principal
            if (query !== "") {
                if (bannerSection) bannerSection.style.display = 'none';
            } else {
                // Si borra todo, volvemos a mostrar el banner
                if (bannerSection) bannerSection.style.display = '';
            }
            
            // Filtrar las tarjetas de productos en tiempo real
            const tarjetasProductos = document.querySelectorAll('.product-card');
            if (tarjetasProductos.length === 0) return;

            tarjetasProductos.forEach(card => {
                const titulo = card.querySelector('.product-title')?.textContent.toLowerCase() || "";
                const precio = card.querySelector('.product-price')?.textContent.toLowerCase() || "";
                
                if (titulo.includes(query) || precio.includes(query)) {
                    card.style.display = ""; 
                } else {
                    card.style.display = "none"; 
                }
            });
        }
    });

    // Si el usuario hace clic en cualquier otro lado de la página, restauramos el banner y limpiamos la vista si es necesario
    document.addEventListener('click', (e) => {
        const searchBox = document.querySelector('.search-box');
        const bannerSection = document.querySelector('.hero-section') || document.querySelector('.banner-section') || document.querySelector('header + section');
        const searchInput = document.getElementById('searchInput');

        // Si hacen clic fuera del buscador y el input está vacío, aseguramos que el banner vuelva a verse
        if (searchBox && !searchBox.contains(e.target)) {
            if (searchInput && searchInput.value.trim() === "") {
                if (bannerSection) bannerSection.style.display = '';
            }
        }
    });
});s