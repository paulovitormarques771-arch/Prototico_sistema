# EletroPlan — atualização de manutenção por área

## Escopo e decisões

Implementar a nova solicitação sobre a aplicação existente, sem reinicializar o projeto nem remover o dashboard de demonstração: seleção de área como primeiro passo operacional; equipamentos filtrados pela área ativa; cadastros demonstrativos; histórico rastreável de troca e baixa/descarte sem apagar o ativo anterior; motor 3D real no painel; paleta azul-marinho metálico, laranja metálico e branco; e uma linguagem mais prática e específica de manutenção industrial.

O projeto continuará sem servidor e sem banco de dados. A área ativa, cadastros feitos durante a demonstração e eventos de troca/baixa poderão ficar no `localStorage` deste navegador para facilitar a avaliação, com aviso persistente de que não há sincronização com CBSI/CSN. Isso não é um registro operacional compartilhado nem substitui uma base corporativa. Os equipamentos atualmente existentes permanecem identificados como DEMO; uma associação demonstrativa às áreas serve apenas para exercitar filtros e seleção e não afirma a localização real de ativos da CSN.

Não foi encontrado arquivo promocional de vídeo nos arquivos públicos do projeto nem no inventário entregue. O vídeo original não será simulado por imagem/vídeo genérico. Depois de concluir as partes independentes, solicitar um arquivo/link autorizado; a integração final usará o material recebido, em elemento nativo de vídeo com controles e responsividade.

## Fluxo e módulos

1. `Áreas` (`/areas`) aparece antes de Equipamentos e é a tela inicial enquanto não existir área ativa. A lista é exatamente: Aciaria, Sinter, Aços longos, Alto-forno, Decapagem e Coqueria. Escolher uma área abre `/equipamentos`; a troca de área continua disponível no cabeçalho.
2. `Equipamentos` mostra somente os equipamentos da área ativa, com pesquisa/filtros simples, estado (operacional, atenção, parado, substituído, descartado), cadastro contextual, ação de troca e ação de baixa/descarte. Trocar conserva o registro antigo como substituído, cria e vincula o novo equipamento e guarda data/motivo/referência informados. Baixa conserva o ativo, exige data e motivo, aceita destinação/referência de autorização quando informadas e o marca como descartado. Validar duplicidade do código e campos obrigatórios.
3. Ações de cadastro e histórico ficam locais nesta versão, preservadas entre recargas no mesmo navegador e rotuladas como demonstração/local. Não habilitar backend, login ou persistência remota.
4. O dashboard mantém métricas, filtros, alertas, OS e atividades atuais. O seletor do motor respeitará a área escolhida; se não houver registro nessa área, mostrar o motor genérico e instrução clara para cadastrar/selecionar um ativo. A cena do motor será um modelo procedural verdadeiramente tridimensional em Three.js, com iluminação e materiais metálicos, controles por arrasto e botões, rotação lenta opcional e fallback para WebGL indisponível/redução de movimento. Carregar a biblioteca/cena sob demanda para proteger o bundle inicial.
5. Integrar o vídeo promocional só quando houver arquivo ou URL autorizado; preservar controles, legenda/contexto acessível e carregamento econômico.

## Design

**Design Movement:** centro de manutenção industrial contemporâneo, com linguagem de instrumentação física e superfícies em aço usinado — mais oficina de controle e menos HUD cenográfico.

**Core Principles:** orientação pelo fluxo de trabalho; hierarquia e estados legíveis à distância; rastreabilidade sem apagar histórico; efeitos visuais limitados ao que ajuda a operação.

**Color Philosophy:** azul-marinho e grafite metálico dão estabilidade e contraste; branco frio sustenta leitura prolongada; laranja metálico aponta ação, seleção e intervenção sem neon. Verde, amarelo e vermelho ficam reservados a estados semânticos positivo, atenção e crítico.

**Layout Paradigm:** percurso explícito Área → Equipamento → Ação; painel de trabalho com área ativa sempre visível, filtros próximos da lista e dados do ativo junto das ações; cartões densos mas respirados.

**Signature Elements:** filetes de aço escovado no contorno dos painéis; laranja queimado em ações e foco; plaquetas técnicas compactas com código e estado do ativo.

**Interaction Philosophy:** seletores diretos, ações primárias nomeadas, confirmação e resumo antes de baixa/troca; teclado/foco visível; nenhum gesto ou animação obrigatório.

**Animation:** apenas transições curtas de estado e rotação lenta do motor quando autorizada. Arrasto pausa a rotação; `prefers-reduced-motion` desliga-a. Reduzir pixel ratio/cena no celular e liberar geometrias/renderizador ao desmontar.

**Typography System:** conservar Inter/sistema já carregado; títulos e números em pesos médios, códigos em monoespaçada e rótulos auxiliares com contraste e tamanho mínimos de leitura.

**Brand Essence:** mesa de manutenção que deixa a próxima ação e o histórico do ativo claros — objetiva, robusta e rastreável.

**Brand Voice:** rótulos concisos de operação, sem slogans genéricos. Exemplos: “Selecione a área onde vai atuar.” e “Baixa registrada. O histórico do equipamento foi mantido.”

**Wordmark & Logo:** manter o wordmark EletroPlan já implementado e o espaço institucional reservado para o logo oficial, sem inventar a marca CSN/CBSI.

**Signature Brand Color:** laranja metálico discreto `#C47A3A` sobre azul-marinho `#0B1421`, com branco-gelo `#F1F4F6`.

## Estrutura afetada

- `client/src/App.tsx`: área ativa, estado local de equipamentos/histórico, rotas e fluxo inicial.
- `client/src/data/areas.ts` e `client/src/data/equipment-lifecycle.ts`: áreas, tipos, validação serializada e mapeamento explicitamente demonstrativo.
- `client/src/pages/AreasPage.tsx` e `EquipmentWorkspace.tsx`: seleção de área, cadastro, pesquisa, estado e eventos de ativo.
- `client/src/components/electroplan/AppShell.tsx`: navegação Áreas → Equipamentos, contexto/troca de área e seletores atualizados.
- `client/src/components/electroplan/Motor3D.tsx`: motor procedural WebGL, responsivo e carregado sob demanda.
- `client/src/pages/Dashboard.tsx` e `client/src/components/electroplan/DashboardCharts.tsx`: área ativa e paleta coordenada, preservando cálculos/filtros existentes.
- `client/src/index.css`: sistema visual azul metálico/laranja/branco, foco e breakpoints sem tema holográfico excessivo.
- `client/public/manus-routes.json`: incluir rota `/areas` e manter as páginas existentes.

## Restrições técnicas

Continuar no runtime React/Vite/TypeScript atual, usar instalação pnpm existente e adicionar apenas Three.js e seus tipos necessários; lazy-load na fronteira do modelo 3D. Preservar `runtime.port`, TypeScript diagnostics, rotas relativas, dados/funcionalidades já disponíveis, construção estática e `app.config.ts`. Não ativar servidor/banco, não conectar equipamento físico, não expor dados reais e não publicar sem autorização.


## Ajuste solicitado — cadastro de manutenção preventiva
A rota `/preventiva` deixa de exibir o cartão genérico de módulo futuro e passa a oferecer um fluxo operacional demonstrativo. O botão “Adicionar manutenção” abre um formulário simples: número/referência da OS informado pelo usuário (obrigatório), equipamento ativo selecionado na área atual (obrigatório) e data prevista (opcional). A lista apresenta os registros existentes da demonstração sem inventar OS para eles, junto aos novos registros criados na sessão e marcados como LOCAL. Os cadastros ficam em uma chave própria do `localStorage`, permanecem restritos à área e não enviam dados nem criam OS em outro módulo. Se não houver área selecionada, a etapa de escolha de área continua sendo obrigatória; se não houver equipamento ativo, o CTA orienta cadastrá-lo primeiro.


## Estrutura acrescentada — Manutenção preventiva
- `client/src/data/preventive-maintenance.ts`: tipo e validação de registros locais com chave de armazenamento independente.
- `client/src/pages/PreventiveMaintenancePage.tsx`: busca, filtros, lista de demonstração e formulário que exige OS e equipamento ativo na área selecionada.
- `client/src/App.tsx`: conecta a página `/preventiva` ao contexto compartilhado da área e dos equipamentos existentes.
