# TaskFlow — Gerenciador de Tarefas

Aplicação web para organizar tarefas com **prioridade, categoria e prazo**, com painel de resumo e dados salvos no próprio navegador.

**🔗 Demo:** `https://taskflow-brazuca.lovable.app`

> Projeto de estudo, criado com **Lovable** como primeiro contato com desenvolvimento assistido por IA (vibe coding).

---

## ✨ Funcionalidades

- Adicionar, editar, concluir e excluir tarefas
- Campos: título, descrição (opcional), prioridade (baixa, média, alta), categoria (Trabalho, Estudos, Pessoal) e prazo
- Filtros por status, prioridade e categoria, além de busca por título
- Painel de resumo: total, pendentes, concluídas e atrasadas
- Tarefas atrasadas destacadas em vermelho
- Barra de progresso com a porcentagem de tarefas concluídas
- Botão "Limpar concluídas" com confirmação
- Modo claro e escuro
- Layout responsivo (desktop e celular)
- Dados persistidos no `localStorage` (sem backend)

## 🖼️ Telas

> Adicione prints em `docs/img/` e referencie aqui.

![TaskFlow](docs/img/taskflow.png)

## 🛠️ Tecnologias

- **Lovable** — geração e ajustes por prompts
- **React + TypeScript + Tailwind CSS** — stack gerada pelo Lovable 
- **localStorage** — persistência dos dados no navegador
- **GitHub** — controle de versão

## ▶️ Como rodar localmente

```bash
git clone URL_DO_REPOSITORIO
cd NOME_DA_PASTA
npm install
npm run dev
```

---

## 🧠 Processo de desenvolvimento

Construído em ciclos de **prompt → teste → correção**:

| Etapa | O que foi feito | Problema encontrado | Solução |
|---|---|---|---|
| 1 | Prompt inicial com funcionalidades, design e regras | — | — |
| 2 | Correção em lote | Barra branca ao abrir seletores; tela piscando ao trocar o tema; pouco contraste entre claro e escuro | Prompt único com os 3 ajustes e paleta de cores definida |
| 3 | Novos recursos | — | Barra de progresso e botão "Limpar concluídas" |

### Aprendizados

- Prompts bem estruturados (funcionalidades, design e regras separados) geram resultados melhores.
- Testar tudo antes de pedir ajustes permite agrupar correções e economizar créditos.
- Definir cores em hexadecimal evita resultados genéricos no design.
- Instruir "não alterar o que já funciona" protege o restante do app.

---

## 📄 Licença

Projeto de estudo, sem fins comerciais.
