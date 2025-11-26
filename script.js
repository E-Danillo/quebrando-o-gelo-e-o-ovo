document.addEventListener('DOMContentLoaded', function() {
    
    // URLs base da API TheMealDB
    const THEMEALDB_URL_SEARCH_NAME = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
    const THEMEALDB_URL_LOOKUP = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i='; 
    const THEMEALDB_URL_SEARCH_INGREDIENT = 'https://www.themealdb.com/api/json/v1/1/filter.php?i=';

    // --- 1. Busca por NOME (Seção "busca-receita") e Exibição da Lista ---

    // Referência corrigida para o ID "busca-receita" (assumindo que o HTML foi editado)
    const formBuscaReceita = document.querySelector('#busca-receita form'); 
    const inputReceitaNome = document.getElementById('receita');
    const containerExemplosReceita = document.querySelector('#blocoreceita');

    function buscarReceitasPorNome(nome) {
        if (!nome.trim()) {
            alert("Por favor, digite o nome de uma receita.");
            return;
        }

        const url = `${THEMEALDB_URL_SEARCH_NAME}${nome}`;
        containerExemplosReceita.innerHTML = '<p style="text-align: center; color: #d1d119;">Buscando receitas...</p>';

        fetch(url)
            .then(response => response.json())
            .then(data => {
                exibirReceitasBuscadas(data.meals, containerExemplosReceita);
            })
            .catch(error => {
                console.error('Erro ao buscar receitas por nome:', error);
                containerExemplosReceita.innerHTML = '<p style="text-align: center; color: #d1d119;">Erro ao carregar receitas. Tente novamente.</p>';
            });
    }

    function exibirReceitasBuscadas(receitas, container) {
        container.innerHTML = '';
        
        // Renderiza o formulário novamente (para manter o input)
        container.innerHTML = `
            <form method="get" class="botao" id="form-receita-recarregado"> 
                <p>
                    <label for="receita">Receita: </label>
                    <input type="text" id="receita-reloaded" required placeholder="Digite sua Receita">                         
                    <input type="submit" value="Enviar" >
                    <input type="reset" value="Limpar">
                </p>
            </form>
        `;

        const listaTitulo = document.createElement('h3');
        
        if (receitas) {
            const receitasLimitadas = receitas.slice(0, 10);
            
            // Título sem a contagem total para limpar a exibição
            listaTitulo.textContent = `Resultados da Busca (${receitasLimitadas.length} encontrados)`;
            container.appendChild(listaTitulo);

            const ul = document.createElement('ul');
            ul.id = 'lista-resultados-busca-nome'; 
            
            receitasLimitadas.forEach(receita => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#" class="link-receita-detalhe" data-id="${receita.idMeal}">${receita.strMeal}</a>`;
                ul.appendChild(li);
            });
            container.appendChild(ul);
        } else {
            listaTitulo.textContent = 'Nenhuma receita encontrada.';
            container.appendChild(listaTitulo);
        }

        // Reanexar o listener de submissão ao novo formulário
        document.getElementById('form-receita-recarregado').addEventListener('submit', function(event) {
            event.preventDefault(); 
            const novoInput = document.getElementById('receita-reloaded');
            buscarReceitasPorNome(novoInput.value);
        });
        
        // Listener para capturar o clique e carregar os detalhes
        anexarListenerDetalheReceita();
    }

    // 1.4. Listener para a busca inicial
    if (formBuscaReceita) {
        formBuscaReceita.addEventListener('submit', function(event) {
            event.preventDefault(); 
            const nomeDaReceita = inputReceitaNome.value;
            buscarReceitasPorNome(nomeDaReceita);
        });
    }
    
    // --- 2. Busca e Exibição dos DETALHES da Receita ---

    const containerDetalhes = document.getElementById('preparo');

    // Função que anexa o clique aos links da lista
    function anexarListenerDetalheReceita() {
        const links = document.querySelectorAll('.link-receita-detalhe');
        links.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault(); 
                const idReceita = event.target.getAttribute('data-id');
                if (idReceita) {
                    buscarDetalhesReceita(idReceita);
                }
            });
        });
    }

    // Busca os detalhes da receita pelo ID
    function buscarDetalhesReceita(id) {
        const url = `${THEMEALDB_URL_LOOKUP}${id}`;
        
        containerDetalhes.innerHTML = '<h2 id="titulo-receita">Carregando Receita...</h2><p style="text-align: center; color: var(--AmareloSol); margin-top: 100px;">Aguarde, buscando detalhes...</p>';

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const receita = data.meals ? data.meals[0] : null;
                if (receita) {
                    renderizarDetalhes(receita);
                    containerDetalhes.scrollIntoView({ behavior: 'smooth' }); 
                } else {
                    containerDetalhes.innerHTML = '<h2 id="titulo-receita">Erro</h2><p style="text-align: center; color: var(--AmareloSol);">Detalhes não encontrados.</p>';
                }
            })
            .catch(error => {
                console.error('Erro ao buscar detalhes da receita:', error);
                containerDetalhes.innerHTML = '<h2 id="titulo-receita">Erro na Busca</h2><p style="text-align: center; color: var(--AmareloSol);">Não foi possível carregar os detalhes.</p>';
            });
    }

    // Função que renderiza a receita completa na seção 'preparo'
    function renderizarDetalhes(receita) {
        const ingredientes = [];
        const instrucoes = receita.strInstructions ? receita.strInstructions.split('\r\n').filter(p => p.trim() !== '') : ['Instruções não disponíveis.'];

        for (let i = 1; i <= 20; i++) {
            const ing = receita[`strIngredient${i}`];
            const measure = receita[`strMeasure${i}`];
            
            if (ing && ing.trim() !== "") {
                ingredientes.push(`<li>${measure} ${ing}</li>`);
            }
        }

        containerDetalhes.innerHTML = `
            <div id="detalhe-receita">
                <h2 id="titulo-receita">${receita.strMeal}</h2>
                <div class="info-imagem">
                    <img src="${receita.strMealThumb}" alt="Imagem da Receita: ${receita.strMeal}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 10px; margin-bottom: 20px;">
                    <p style="color: var(--AmareloSol); text-align: right; font-size: 1rem;">Categoria: ${receita.strCategory || 'N/A'} | País: ${receita.strArea || 'N/A'}</p>
                </div>
                
                <div id="ingredientes">
                    <h3>Ingredientes</h3>
                    <ul>
                        ${ingredientes.join('')}
                    </ul>
                </div>
                
                <div id="mododepreparo">
                    <h3>Modo de Preparo</h3>
                    <ol>
                        ${instrucoes.map(passo => `<li>${passo}</li>`).join('')}
                    </ol>
                </div>
            </div>
        `;
    }

    // --- 3. Busca por INGREDIENTE (Adaptada) ---

    // Referências existentes
    const formBuscaIngrediente = document.querySelector('#preparo form');
    const inputIngredientes = document.getElementById('Ingredientes');

    // ... (restante das funções de busca por ingrediente mantidas) ...

    function buscarReceitasPorIngrediente(ingrediente) {
        if (!ingrediente.trim()) {
            alert("Por favor, digite um ingrediente.");
            return;
        }
        
        const ingredienteFormatado = ingrediente.split(',')[0].trim(); 
        const url = `${THEMEALDB_URL_SEARCH_INGREDIENT}${ingredienteFormatado}`;

        containerDetalhes.innerHTML = `
            <h2 id="titulo-receita">Buscando...</h2>
            <p style="text-align: center; margin-top: 100px; color: var(--AmareloSol);">Carregando receitas com ${ingredienteFormatado}...</p>
        `;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                exibirListaPorIngrediente(data.meals, containerDetalhes);
            })
            .catch(error => {
                console.error('Erro ao buscar receitas por ingrediente:', error);
                containerDetalhes.innerHTML += '<p style="text-align: center; color: var(--AmareloSol);">Erro ao carregar receitas. Tente novamente.</p>';
            });
    }

    function exibirListaPorIngrediente(receitas, container) {
        container.innerHTML = `
            <h2 id="titulo-receita">Resultados com o Ingrediente</h2>
            <div id="lista-ingrediente" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; padding: 20px 0; margin-top: 30px;">
                </div>
        `;
        
        const listaContainer = document.getElementById('lista-ingrediente');
        
        if (!receitas) {
            listaContainer.innerHTML = '<p style="text-align: center; color: var(--AmareloSol); width: 100%;">Nenhuma receita encontrada. Tente outro termo!</p>';
            return;
        }

        receitas.forEach(receita => {
            const card = document.createElement('div');
            card.classList.add('card-ingrediente'); 

            card.innerHTML = `
                <img src="${receita.strMealThumb}" alt="${receita.strMeal}">
                <h4>${receita.strMeal}</h4>
            `;
            
            card.addEventListener('click', () => {
                 buscarDetalhesReceita(receita.idMeal);
            });

            listaContainer.appendChild(card);
        });
    }
});