# ignispyro-public-viewer

Visualizador independente de ficheiros GeoJSON, executado localmente no navegador.

Execute `python -m http.server 8765 --bind 127.0.0.1` nesta pasta, abra http://127.0.0.1:8765 e escolha `example.geojson` ou um ficheiro autorizado. Não envia ficheiros para servidores. Testes: `node --test test.mjs`.

Versão inicial 1.0.0. Componentes autónomos; não substituem nem modificam o portal IGNISPYRO V2. Sem motores internos ou dados operacionais.

Visualizador online independente: https://dsantananet.github.io/ignispyro-public-viewer/ . O carregamento do ficheiro ocorre apenas no navegador.

Desde a versão 1.1.0, o botão **Carregar catálogo IPMA** lê apenas o manifesto público e um GeoJSON por conteúdo em `ignispyro-public-products`, verifica SHA-256 e apresenta o catálogo. Sem acesso ao repositório privado. Se a leitura falhar, preserva a vista anterior. A data de publicação não é a data de uma observação meteorológica.
