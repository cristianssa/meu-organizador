# Meu Organizador

PWA pessoal de um único usuário: treino, dieta, água, finanças, estudo (concurso e mestrado), XP, missões e loja de recompensas. Interface e textos em **português do Brasil**. Publicado no GitHub Pages (branch `main`, raiz).

## Estrutura

| Arquivo | Papel |
|---|---|
| `index.html` | O app inteiro: HTML, CSS e JavaScript em um arquivo só, sem build e sem dependências. |
| `manifest.json` | Manifesto da PWA (nome, ícones, `display: fullscreen`). |
| `sw.js` | Service worker: guarda os arquivos para funcionar offline. |
| `icons/icon-192.png`, `icons/icon-512.png` | Ícones (sol sobre fundo laranja, servem como `any` e `maskable`). |
| `apps-script/Codigo.gs` | Script opcional que o usuário cola na planilha Google dele para receber o espelho dos dados. |
| `.nojekyll` | Faz o GitHub Pages servir os arquivos como estão. |

Todos os caminhos são **relativos** (`./sw.js`, `icons/...`), porque o site roda em `/meu-organizador/`. Nunca use caminhos começando com `/`.

## Como o código de `index.html` está organizado

- Estado único global `S` (objeto). `DEF` define os valores padrão. Toda mudança chama `save()`, e quem altera a tela chama `render()`.
- `render()` monta a tela inteira com template strings conforme `S.tab` (`treino`, `dieta`, `estudo`, `heroi`, `fin`, `cfg`). Sub-telas usam `S.tv` (treino), `S.dv` (dieta) e `S.ev` (estudo).
- `UI`: lista de chaves de `S` que são só estado de tela. Elas não entram no backup nem no cálculo de "mudou ou não" (`dstr()`).
- `mig()`: migrações por versão (`S.v`). Para mudar o formato dos dados, crie um novo `if((S.v||0)<N){...;S.v=N}` no fim de `mig()`. Não altere migrações antigas, porque backups antigos passam por elas.
- Sempre passe texto do usuário por `esc()` antes de colocá-lo no HTML.

## Armazenamento (sem nuvem)

- Os dados ficam só no aparelho: `localStorage['org1']` (lido de forma síncrona ao abrir) + IndexedDB (banco `meu-organizador`, store `kv`, chave `org1`), que é a cópia mais durável.
- Ao abrir, `initLocal()` compara as duas cópias pelo carimbo `S.dts` e fica com a mais nova. Também pede `navigator.storage.persist()`.
- `save()` grava no localStorage na hora e no IndexedDB 300 ms depois (e na hora quando a página vai para o fundo).
- **Não existe mais `window.claude`** (o app era um artifact do Claude). Não reintroduza `claude.use(...)`.

## Backup e planilha (tela "Planilha e backup", `S.tab='cfg'`)

- Exportar: arquivo `.json` no formato `{app:'meu-organizador',v:1,exportado,data}` (`bkJson()`), ou copiar o texto. Importar: arquivo ou texto colado (`impObj()` aceita `{data:{...}}` ou o objeto direto). Mantenha esse formato compatível: é como os dados migram entre aparelhos.
- Espelho opcional na planilha: `sheetRows()` monta as linhas por aba, `HDR` tem os cabeçalhos e `OPT` as abas que só são criadas se tiverem dados. O app faz POST (`text/plain`) para a URL `/exec` do Apps Script com `{key,hdr,opt,rows}`. Sem internet, fica em espera (`shSt='wait'`) e envia quando a conexão volta. Se mudar `HDR` ou `sheetRows()`, o script não precisa mudar.

## Regras do app (não quebrar)

- **Treino segue a sequência 1 → 5, sem relação com o dia da semana.** `S.split` tem 5 treinos e `S.next` é o índice do próximo. Ao concluir (`fim()`), `S.next = (dia + 1) % S.split.length`, ou seja, depois do 5 volta para o 1. O usuário pode escolher outro treino da lista manualmente. Nunca calcule o treino a partir da data.
- Cada exercício tem um número padrão de séries (`s`). Na sessão dá para somar ou tirar séries extras. Ao lado de cada série aparece o último registro (reps × kg) do mesmo exercício.
- Dieta: dois planos, `A` (mais carboidrato) e `B` (low carb). `S.defPlan` é o padrão e `S.dayPlan[data]` troca por dia. São 5 refeições (`S.mealNames`). Cada refeição pode ser marcada "conforme" ou "fora" (`S.mst`).
- Dia dentro da dieta = pelo menos 3 refeições "conforme". Dia perfeito = todas.
- Água: meta padrão de 3500 ml, registros com horário em `S.wlog`, distribuídos entre `wakeFrom` e `wakeTo`.
- **XP, nível e brasas nunca são guardados:** são sempre recalculados dos registros em `gStats()`. Apagar um registro remove o XP dele. Refeição fora do plano não dá nem tira nada. Estudo dá XP, mas não dá brasas. As regras detalhadas estão na tela Herói ("Como ganhar XP e brasas") e precisam bater com `gStats()`.
- Nível: `need(n) = 75·n·(n−1)` de XP.
- Missões diárias valem +25 XP cada. As semanais (semana de segunda a domingo, `wkKey`) dão XP e brasas fixos.
- Loja da Chama: cada item tem preço e limite por semana. "Refeição livre" usada num dia conta como refeição dentro da dieta.
- Datas são strings `AAAA-MM-DD` no horário local (`td()`), nunca em UTC.

## Ao alterar o app

1. Edite `index.html` (ou os outros arquivos).
2. **Aumente `VERSAO` em `sw.js`** (`v1` → `v2` …) para os celulares baixarem a versão nova.
3. Teste servindo a pasta por HTTP (`npx serve .` ou `python -m http.server`) e confira: o app abre, os dados persistem ao recarregar, o backup exporta e importa, e o app funciona offline (DevTools › Network › Offline).
4. Faça o commit na `main`. O GitHub Pages publica sozinho.
