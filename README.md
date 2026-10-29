# EletroPlan — Gestão da Manutenção Industrial

Protótipo de uma interface para organizar a manutenção industrial por área, acompanhar equipamentos e registrar manutenções preventivas vinculadas a uma ordem de serviço (OS).

> **Ambiente de demonstração:** os dados de exemplo não representam o inventário nem a operação real da CSN ou da CBSI. A aplicação ainda não está conectada a sistemas corporativos, equipamentos industriais ou banco de dados.

## O que está disponível

- **Áreas:** seleção da área de atuação antes de consultar os equipamentos. As áreas de demonstração são Aciaria, Sinter, Aços longos, Alto-forno, Decapagem e Coqueria.
- **Visão geral:** indicadores e gráficos de demonstração, alertas derivados dos dados apresentados e modelo 3D interativo de um motor industrial genérico.
- **Equipamentos:** consulta por área, busca, cadastro local e acompanhamento do ciclo de vida. Os registros permitem documentar troca de equipamento e baixa/descarte sem apagar o histórico.
- **Manutenção preventiva:** cadastro de uma manutenção com referência da OS e equipamento ativo da área selecionada. A data prevista é opcional; o formulário não cria nem valida uma OS corporativa.

A interface também apresenta links para Ordens de serviço, Histórico de falhas, Materiais e componentes, Segurança, Paradas industriais, Relatórios e Administração. Esses módulos ainda não constituem fluxos operacionais conectados e podem permanecer como áreas demonstrativas ou em preparação.

## Limites dos dados e da operação

Seleção de área e registros criados são armazenados localmente no navegador (`localStorage`). Eles não são enviados nem sincronizados com a CSN/CBSI, não ficam disponíveis para outras pessoas ou dispositivos e podem ser removidos ao limpar os dados do navegador. Não há, nesta etapa, autenticação, permissões reais, persistência central, cópia de segurança ou integração com OS corporativa, sensores, CLPs ou outros sistemas.

Não insira informações confidenciais ou dados reais de produção neste protótipo. Os equipamentos e seus vínculos de demonstração às áreas são exemplos fictícios. Procedimentos de manutenção, decisões de segurança, diagnóstico de falhas e autorização de trabalho continuam dependendo da equipe técnica responsável.

A identidade visual do EletroPlan é própria. O espaço reservado à marca institucional CBSI deve receber somente o arquivo oficial autorizado, sem redesenhar ou alterar o logotipo.

## Requisitos

- Node.js `^20.19.0` ou `>=22.12.0` (faixa exigida pelo Vite instalado).
- pnpm `10.18.0` (versão declarada em `package.json`).

## Executar localmente

Na pasta do projeto, instale as dependências e inicie a interface estática:

```bash
corepack enable
corepack prepare pnpm@10.18.0 --activate
pnpm install
pnpm dev:static
```

Abra `http://localhost:3000` no navegador. Para usar outra porta, defina `PORT` antes de iniciar o servidor.

## Verificações e build

```bash
pnpm check
pnpm test
pnpm build:static
```

O build estático é gerado em `dist/public`. O starter também contém arquivos de servidor e banco de dados para evolução futura, mas esses serviços não fazem parte do protótipo conectado entregue nesta etapa.

## Organização principal

- `client/src/pages/`: páginas de Áreas, Visão geral, Equipamentos e Manutenção preventiva.
- `client/src/components/electroplan/`: navegação e componentes específicos do produto, como gráficos e modelo 3D.
- `client/src/data/`: áreas, registros demonstrativos, ciclo de vida de equipamentos e manutenção preventiva local.
- `client/public/`: arquivos estáticos da interface e manifesto de rotas.
- `server/`, `shared/` e `drizzle/`: estrutura do starter reservada a uma futura etapa de backend; não implica que haja conexão operacional ativa.

## Repositório

Este projeto é mantido como um protótipo em evolução. Antes de usar com dados reais ou em uma operação industrial, configure e valide backend, autenticação, permissões, persistência, políticas de segurança e os fluxos técnicos com os responsáveis da organização.
