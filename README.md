# Tarefa Fácil

Crie um app web de gerenciamento de tarefas chamado "TaskFlow", em português do Brasil.

FUNCIONALIDADES:

- Adicionar tarefa com: título (obrigatório), descrição (opcional), prioridade (baixa, média, alta), categoria (Trabalho, Estudos, Pessoal) e data de prazo.

- Marcar tarefa como concluída, editar e excluir.

- Filtros por status (todas, pendentes, concluídas), por prioridade e por categoria, além de busca por texto no título.

- Painel de resumo no topo com cards: total de tarefas, pendentes, concluídas e atrasadas (prazo vencido e não concluídas).

- Tarefas atrasadas devem aparecer destacadas em vermelho.

- Salvar os dados no localStorage para que persistam ao recarregar a página.

DESIGN:

- Visual limpo e moderno, cor principal azul, cantos arredondados, boa espaçamento.

- Prioridade representada por badges coloridos (verde, amarelo, vermelho).

- Totalmente responsivo, funcionando bem no celular.

- Botão para alternar entre modo claro e escuro.

REGRAS:

- Não use backend nem login neste momento.

- Página única, sem rotas adicionais.

- Mostre uma mensagem amigável quando não houver tarefas.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://taskflow-brazuca.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fb62b092-d625-5372-a93a-cd67c3e71dfe).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
