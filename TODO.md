# EletroPlan — resultados e requisitos

## 1. Casca visual, navegação e cabeçalho da Etapa 1
- [x] Criar identidade visual industrial premium, futurista e corporativa para CBSI/EletroPlan, com fundo azul-marinho e grafite, superfícies metálicas/vidro escuro, ciano elétrico contido, azul tecnológico e branco frio; verde apenas para estados positivos/concluídos, âmbar para atenção/vencimentos e vermelho para falhas críticas. Usar gradientes discretos, bordas finas, reflexos controlados, transparências e sombras profundas; evitar excesso de neon, cores aleatórias, visual administrativo genérico e efeitos que prejudiquem a leitura.
- [x] Usar logo oficial CBSI somente quando fornecido, preservando integralmente proporções, cores, tipografia e identidade; sem arquivo, manter reserva visual e não simular marca oficial. EletroPlan terá identidade própria, respeitando CBSI.
- [x] Usar tipografia moderna e legível (preferencialmente Inter ou equivalente) com hierarquia clara para títulos, subtítulos, indicadores, tabelas e textos auxiliares; números legíveis e alinhados.
- [x] Implementar navegação lateral fixa no desktop, adaptada a telas menores, com ícones consistentes, módulo ativo destacado, links funcionais e a ordem: Visão geral; Equipamentos; Manutenção preventiva; Ordens de serviço; Histórico de falhas; Materiais e componentes; Segurança; Paradas industriais; Relatórios e indicadores; Administração. No rodapé, exibir usuário/perfil demonstrativos e opção de sair sem alegar autenticação real.
- [x] Cabeçalho: módulo atual, breadcrumb, busca global funcional sobre demonstrações, central de notificações sem tratar avisos fictícios como eventos reais, data atual, perfil e configurações.
- [x] Responsivo para computador, tablet e celular; foco visível, navegação por teclado, contraste suficiente, textos legíveis e estados não dependentes apenas de cor ou animação. Respeitar `prefers-reduced-motion` e simplificar 3D/animação no celular ou equipamento menos potente.

## 2. Dashboard de demonstração da Etapa 1
- [x] Dashboard principal com título “Centro de Inteligência de Manutenção” e subtítulo “Visão integrada dos ativos, serviços programados e desempenho operacional.”, data e seletor de período.
- [x] Identificar claramente os dados exibidos como demonstração. Não inventar dados reais da CBSI, percentuais de melhoria, economias financeiras, especificações de ativos, previsões certas ou conexões com máquinas/CLPs/sensores/sistemas corporativos.
- [x] Mostrar seis indicadores calculados somente dos registros disponíveis: equipamentos cadastrados; preventivas programadas; preventivas atrasadas; ordens de serviço abertas; equipamentos com falhas registradas; intervenções concluídas no período. Comparar com período anterior somente se houver dados históricos suficientes.
- [x] Criar visual central de conjunto eletromecânico genérico, sem afirmar ser ativo CBSI; permitir selecionar equipamento demonstrativo e atualizar código patrimonial, nome, localização, criticidade, estado operacional registrado, última manutenção e próxima manutenção prevista. Se 3D pesado/incompatível, usar alternativa SVG/CSS/gradientes; não inventar especificações técnicas.
- [x] Gráficos: preventivas concluídas e pendentes por mês; ordens por status; falhas por categoria; equipamentos por criticidade; histórico de custos somente quando houver dados. Incluir filtro de período, legendas claras, tooltips, animação discreta e estados de carregamento, erro e ausência de dados.
- [x] Alertas derivados dos registros: manutenção próxima do vencimento, manutenção atrasada, OS prioritárias, equipamentos com falhas recorrentes e pendências de segurança registradas. Cada alerta leva ao registro correspondente existente, sem afirmar causa não confirmada nem inventar notificações.
- [x] Atividades recentes com data, tipo, equipamento, responsável e status; se fictícias, identificar como demonstração.
- [x] Usar cartões com composição, hierarquia, espaçamento e estados normal/atenção/crítico/concluído refinados; camadas holográficas/glassmorphism, reflexos e iluminação ciano sutis, linhas técnicas discretas e microinterações suaves sem sacrificar leitura ou desempenho.

## 3. Equipamentos (Etapa 2)
- [ ] Cadastro, consulta, edição e detalhe dos equipamentos com código único, nome, categoria, fabricante, modelo, número de série, tensão nominal, potência quando aplicável, localização, setor, criticidade, data de cadastro, situação operacional, observações e fotografia/documento quando disponível.
- [ ] Busca por código e nome; filtros por categoria, localização, criticidade e situação. Detalhe com abas: Resumo; Dados técnicos; Planos preventivos; Ordens de serviço; Histórico de falhas; Materiais utilizados; Documentos anexados.
- [ ] Não inventar especificações para equipamento real; dados demonstrativos devem ser claramente identificados.

## 4. Manutenção preventiva e ordens de serviço (Etapa 2)
- [ ] Planos preventivos vinculados a equipamentos com equipamento, descrição da tarefa, tipo de inspeção, periodicidade, data da última execução, próxima data prevista, responsável/equipe, duração estimada, instrução técnica aprovada, materiais necessários, checklist e situação. Visualização lista e calendário; estados em dia, próxima do vencimento, atrasada, em execução e concluída; calcular vencimentos pela periodicidade e datas registradas. Não gerar procedimento técnico automaticamente sem validação profissional.
- [ ] Criar e acompanhar ordens preventivas e corretivas com número, tipo, equipamento, descrição da solicitação, sintomas, prioridade, responsável, abertura, prazo planejado, início, conclusão, diagnóstico, causa identificada, serviço executado, materiais, tempo de execução, observações, anexos/fotos e situação atual.
- [ ] Fluxo: Aberta → Planejada → Em execução → Aguardando material ou liberação → Concluída → Encerrada; permitir configuração conforme política da empresa. Tabela e Kanban, filtros, busca, paginação e histórico de alterações. Encerramento valida campos obrigatórios por tipo de ordem.

## 5. Falhas, materiais/componentes, segurança e paradas (Etapa 3)
- [ ] Histórico de falhas: equipamento, data/hora, sintoma, categoria, condições observadas, causa somente quando confirmada, ação corretiva, tempo de indisponibilidade, materiais, OS relacionada e responsável. Histórico cronológico e gráficos de recorrência; reconhecer repetição sem declarar causa não confirmada.
- [ ] Materiais: código, descrição, categoria, quantidade, unidade, localização, estoque mínimo, custo unitário registrado, movimentações, equipamento e OS relacionados. Avaliação de componentes removidos com estados aguardando avaliação, aprovado para reparo, aprovado para reutilização, disponível em estoque, encaminhado para reciclagem e descarte autorizado. Nenhum componente é seguro para reutilização sem avaliação técnica adequada. Diferenciar economia estimada, custo efetivamente evitado e receita efetivamente obtida; componente recuperado não vira receita automaticamente.
- [ ] Segurança: registrar verificações, riscos e ações com atividade, localização, equipamento, perigo, condição observada, medida preventiva necessária, responsável, prazo, situação e evidência de correção; categorias configuráveis elétrica, mecânica, altura, movimentação de cargas, organização e outros. A aplicação documenta, mas não substitui APR, Permissão de Trabalho, bloqueio/etiquetagem, procedimentos, treinamento ou aprovação profissional; animação, pontuação e indicador nunca autorizam atividade de risco.
- [ ] Paradas industriais: nome, área, início/término, equipamentos, OS previstas, equipes, materiais, dependências, pendências de segurança e status; linha do tempo/calendário e resumo de pendências para coordenação pré-parada.

## 6. Relatórios, permissões e backend (Etapa 4)
- [ ] Relatórios filtrados por período, setor, equipamento, categoria e responsável, conforme permissões; exportação CSV e PDF quando suportado; documentar fórmulas. Indicadores possíveis: preventivas concluídas no prazo; OS abertas/concluídas/atrasadas; falhas por equipamento; MTTR; MTBF somente com dados suficientes; indisponibilidade registrada; custos; consumo de materiais; componentes recuperados; ações preventivas de segurança concluídas.
- [ ] Preparar perfis Administrador, Gestor de manutenção, Planejador, Técnico de manutenção e Consulta com permissões de visualizar/criar/editar/aprovar/excluir conforme perfil. Validar permissões também em backend e banco de dados, não apenas ocultando botões. Não criar conta administrativa com senha fixa ou credenciais expostas.
- [ ] Fase futura de backend: PostgreSQL via Lovable Cloud ou Supabase, autenticação, permissões, persistência e armazenamento de arquivos. Até backend estar configurado, interface usa dados demonstrativos claramente identificados e não finge conexão real; nunca expor chaves privadas/senhas no frontend.

## 7. Qualidade do produto em todas as etapas
- [ ] Botões principais executam ações reais; navegação correta; formulários validam campos obrigatórios; busca e filtros alteram resultados; indicadores derivam dos registros; gráficos/tabelas apresentam carregamento, erro e ausência de dados; sem links quebrados ou ações decorativas.
- [ ] Não remover funcionalidades; não tratar dados fictícios como informações CBSI; não inventar integração industrial; não afirmar previsões como certeza; preservar legibilidade, desempenho, acessibilidade e estrutura preparada para expansão.

## 8. Revisão da Etapa 1
- [x] Verificar visualmente as telas principais em desktop e viewport móvel; corrigir desalinhamentos, inconsistências, problemas de contraste e responsividade.

## 9. Nova solicitação — operação por áreas, ativos e identidade de manutenção
- [x] Operação Áreas: permitir escolher a área CSN antes de entrar em Equipamentos; áreas exatas: Aciaria, Sinter, Aços longos, Alto-forno, Decapagem e Coqueria. Mostrar a área ativa e permitir trocá-la com clareza.
- [x] Equipamentos por área: depois de escolher uma área, consultar, selecionar e cadastrar os equipamentos associados a ela; oferecer busca e filtros por ciclo de vida. Os registros existentes são exemplos identificados como DEMO; seus vínculos às áreas não afirmam localização real na CSN.
- [x] Rastreabilidade de ciclo de vida: registrar troca mantendo o equipamento anterior como substituído e vinculando o novo; registrar baixa/descarte com data e motivo; preservar o histórico sem apagar o ativo; validar código e campos obrigatórios.
- [x] Persistência provisória somente neste navegador e aviso claro de que cadastros/eventos não são enviados, sincronizados com CSN/CBSI nem salvos em banco. Backend continua desligado e não há conexão operacional.
- [x] Reidentidade visual para manutenção industrial sob medida: azul escuro metálico, laranja metálico e branco; navegação e ações focadas no trabalho, cartões e tipografia práticos, estados legíveis, sem excesso de brilho, neon ou estética genérica. Preservar responsividade, contraste, acessibilidade e desempenho.
- [x] Motor 3D real, leve e navegável pelo usuário, com iluminação e materiais metálicos; rotação suave opcional, controles manuais, movimento reduzido e carregamento sob demanda.
- [ ] Vídeo promocional: inserir no local mais útil com controles acessíveis e carregamento responsivo quando houver arquivo/link autorizado. Nenhum vídeo promocional foi localizado no material disponível; não substituir por conteúdo genérico.
- [x] Revisar visualmente Áreas em viewport móvel e Áreas, Equipamentos e dashboard em desktop; conferir fluxo Área → Equipamento, motor 3D, cadastro, troca, baixa/descarte e limpar os dados sintéticos de teste.


## 10. Cadastro de manutenção preventiva
- [x] Na página Manutenção preventiva, oferecer a opção clara “Adicionar manutenção”.
- [x] Ao adicionar, exigir a OS/referência da ordem e selecionar o equipamento; validar que ambos foram informados antes de salvar. Equipamentos devem pertencer à área ativa e estar ativos.
- [x] Depois de salvar, mostrar OS, equipamento e situação na lista da área correspondente; não inventar uma OS para os registros de demonstração antigos nem alterar cálculos ou registros operacionais existentes.
- [x] Marcar cadastros como locais/demonstrativos; preservar os dados somente neste navegador, sem afirmar conexão com banco, OS corporativa ou sistemas da CSN/CBSI. Se não houver equipamento ativo, explicar que é necessário cadastrar um equipamento.
