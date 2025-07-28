document.addEventListener('DOMContentLoaded', () => {

    async function iniciarCarrossel() {
        try {
            const resposta = await fetch('carousel.json');
            if (!resposta.ok) throw new Error('Falha ao carregar imagens');
            const imagens = await resposta.json();

            const swiperWrapper = document.querySelector('.swiper-wrapper');
            if (!swiperWrapper) return;

            imagens.forEach(item => {
                const slide = `
                    <div class="swiper-slide">
                        <img src="${item.imagemUrl}" alt="${item.titulo}">
                        <div class="slide-conteudo">
                            <h3>${item.titulo}</h3>
                            <p>${item.descricao}</p>
                        </div>
                    </div>
                `;
                swiperWrapper.innerHTML += slide;
            });

            const swiper = new Swiper('.swiper', {
                loop: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                effect: 'fade',
                fadeEffect: {
                    crossFade: true
                },
            });

        } catch (erro) {
            console.error("Erro ao iniciar o carrossel:", erro);
        }
    }

    iniciarCarrossel();
});