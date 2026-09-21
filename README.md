<div align="center">
  
# 🎮 PET-EP Gamifica

![License](https://img.shields.io/badge/license-GPL--3.0-blue)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)   

Sistema de Gamificação Automatizado para o Programa de Educação Tutorial da Engenharia de Produção (UFC)

**Palavras-chave:** `gamificação` `gestão acadêmica` `leaderboard` `PET` `engenharia de produção` `automação` `pontuação`

</div>


## 📑 Índice
 
- [Sobre](#-sobre)
- [Equipe](#-equipe)
- [Tecnologias](#-tecnologias)
- [Licença](#-licença)
- [Requisitos Funcionais](#-requisitos-funcionais)


## 📋 Sobre
 
O **PET-EP Gamifica** é uma plataforma desenvolvida para automatizar, centralizar e gamificar o controle de pontos acumulados pelos membros do PET Engenharia de Produção da UFC (os "PETianos").
 
Atualmente, o controle de pontos do grupo é feito de forma manual e descentralizada, através de planilhas eletrônicas e tabelas de referência físicas, o que gera atrasos, erros de preenchimento e falta de transparência no acompanhamento do desempenho dos membros.
 
O sistema resolve esse problema centralizando as tabelas de equivalência de pontos em um banco de dados único, permitindo que coordenadores registrem tarefas realizadas de forma rápida e simples. Com isso, o sistema calcula automaticamente as pontuações, atualiza o extrato individual de cada membro, envia notificações em tempo real e mantém um **Painel de Líderes (Leaderboard)** sempre atualizado, aumentando o engajamento e a transparência no processo de gamificação do grupo.


## 👥 Equipe
 
| Nome | Função | Descrição |
|---|---|---|
| Jonata Monteiro Alves | Product Owner /  UX/UI Designer  |
| Antonio Pedro Martins Alves | Desenvolvedor Full-Stack |
| Pedro Roger Silva Peixoto | Desenvolvedor Full-Stack |
| Joel Soares Silva | Desenvolvedor Full-Stack | Aluno do curso de Sistemas e Mídias Digitais, atualmente aprofundando conhecimentos nas áreas de análise de dados e desenvolvimento web |
| Davi Vasconcelos Viana | UX/UI Designer | Designer gráfico e de interfaces, desenvolvedor front-end e editor de video. Aluno do curso de Sistemas e mídias digitais |
| Danilo Everton Vaz de Sousa | QA / Testes | Aluno do curso de Sistemas e Mídias Digitais. Atualmente focado em estudos nas áreas de design de interfaces e desenvolvimento web |
 

## 🛠 Tecnologias

**Frontend / Fullstack**
- Next.js 14
- React 18
- TailwindCSS

**Backend, Banco de Dados e Autenticação**
- Supabase
  - **PostgreSQL** — banco de dados relacional (armazenamento de membros, atividades, pontuações e semestres)
  - **Supabase Auth** — autenticação de coordenadores e membros
  - **Edge Functions** — lógica de servidor (cálculo de pontos, envio de notificações, regras de negócio)
  - **Realtime** — atualização em tempo real do Painel de Líderes

**Infraestrutura**
- Vercel (hospedagem da aplicação Next.js)

## 📄 Licença
 
Este projeto está licenciado sob os termos da **GNU General Public License v3.0 (GPL-3.0)**.
 
Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
 

## ✅ Requisitos Funcionais

<details>
<summary><strong>Ver tabela completa de Requisitos Funcionais (25 itens)</strong></summary>
<br>

| ID | Título | Descrição | Prioridade | Depende de | Status |
|---|---|---|---|---|---|
| RF01 | Autenticar Usuário | Permitir que membros e coordenadores façam login utilizando e-mail institucional da UFC e senha, com validação de credenciais e emissão de sessão/token de acesso. | Alta | Nenhum | Em Andamento |
| RF02 | Cadastrar Membro | Permitir que o coordenador cadastre um novo membro (PETiano) no sistema, informando nome, e-mail institucional, curso e data de ingresso no PET. | Alta | RF01 | Não iniciado |
| RF03 | Editar Membro | Permitir que o coordenador atualize os dados cadastrais de um membro já existente (nome, e-mail, curso, etc.). | Alta | RF02 | Não iniciado |
| RF04 | Listar Membros | Exibir a lista de todos os membros cadastrados, com opção de busca e visualização de status (ativo/inativo). | Alta | RF02 | Não iniciado |
| RF05 | Inativar Membro | Permitir que o coordenador marque um membro como inativo, removendo-o das listagens de pontuação ativa sem excluir seu histórico. | Alta | RF02 | Não iniciado |
| RF06 | Cadastrar Atividade | Permitir que o coordenador cadastre um novo tipo de atividade/evento (ex: artigo científico, visita técnica), definindo nome e categoria. | Alta | Nenhum | Não iniciado |
| RF07 | Editar Atividade | Permitir que o coordenador atualize as informações de um tipo de atividade já cadastrado. | Alta | RF06 | Não iniciado |
| RF08 | Listar Atividades | Exibir a lista de todos os tipos de atividades/eventos cadastrados no sistema. | Alta | RF06 | Não iniciado |
| RF09 | Configurar Pontuação da Atividade | Permitir que o coordenador defina a pontuação padrão atribuída a cada tipo de atividade, conforme sua complexidade. | Alta | RF06 | Não iniciado |
| RF10 | Lançar Pontuação Individual | Permitir que o coordenador registre a pontuação de um membro específico, selecionando o membro, a atividade realizada e a data de execução. | Alta | RF02, RF09 | Não iniciado |
| RF11 | Lançar Pontuação em Lote | Permitir que o coordenador registre pontuação para múltiplos membros simultaneamente, para atividades realizadas em grupo. | Média | RF10 | Não iniciado |
| RF12 | Consultar Extrato de Pontos | Permitir que o membro visualize seu histórico individual de pontuação, detalhado por data, tipo de atividade e pontos ganhos. | Alta | RF01, RF10 | Não iniciado |
| RF13 | Exibir Painel de Líderes | Exibir, em tempo real, o ranking dos membros ordenado por pontuação semestral decrescente, atualizando automaticamente a cada novo lançamento. | Alta | RF10 | Não iniciado |
| RF14 | Filtrar Painel de Líderes | Permitir que o usuário filtre o Painel de Líderes por período específico (mês atual, semestre corrente ou semestres anteriores). | Média | RF13 | Não iniciado |
| RF15 | Cadastrar Meta de Conquista | Permitir que o coordenador defina metas de pontuação associadas a conquistas/badges digitais. | Média | RF06 | Não iniciado |
| RF16 | Atribuir Badge Automaticamente | Atribuir automaticamente uma medalha/badge digital ao membro assim que ele atingir a meta de pontos configurada. | Média | RF10, RF15 | Não iniciado |
| RF17 | Enviar Notificação de Pontuação | Enviar automaticamente uma notificação por e-mail ao membro sempre que novos pontos forem creditados em seu extrato. | Baixa | RF10 | Não iniciado |
| RF18 | Solicitar Ajuste de Pontos | Permitir que o membro abra uma solicitação de revisão caso identifique uma divergência em seu extrato, dentro do prazo de 10 dias corridos após a publicação do lançamento. | Média | RF12 | Não iniciado |
| RF19 | Visualizar Solicitações de Ajuste | Permitir que o coordenador visualize a lista de solicitações de ajuste de pontos enviadas pelos membros, com seus respectivos status. | Média | RF18 | Não iniciado |
| RF20 | Aprovar Solicitação de Ajuste | Permitir que o coordenador aprove uma solicitação de ajuste, atualizando automaticamente a pontuação do membro conforme o pedido. | Média | RF18 | Não iniciado |
| RF21 | Rejeitar Solicitação de Ajuste | Permitir que o coordenador rejeite uma solicitação de ajuste, mantendo a pontuação original e informando o motivo ao membro. | Média | RF18 | Não iniciado |
| RF22 | Configurar Semestre Letivo | Permitir que o coordenador defina as datas de início e término do semestre letivo, incluindo a configuração do zeramento automático do ranking. | Alta | Nenhum | Não iniciado |
| RF23 | Editar Lançamento de Pontuação | Permitir que o coordenador corrija um lançamento de pontuação realizado com erro de digitação. | Alta | RF10 | Não iniciado |
| RF24 | Excluir Lançamento de Pontuação | Permitir que o coordenador exclua um lançamento de pontuação realizado indevidamente. | Alta | RF10 | Não iniciado |
| RF25 | Exibir Pódio do Semestre | Exibir uma interface em destaque com os três primeiros colocados (1º, 2º e 3º lugares) ao final do período letivo, oficializando os vencedores do semestre. | Alta | RF13, RF22 | Não iniciado |

</details>
