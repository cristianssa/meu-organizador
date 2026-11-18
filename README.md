# Meu Organizador

App pessoal (PWA) de treino, dieta, água, finanças, estudo, XP e missões. Funciona sem internet e pode ser instalado na tela inicial do celular.

## Publicar no GitHub Pages

1. No GitHub, abra o repositório › **Settings** › **Pages**.
2. Em **Build and deployment**, escolha **Source: Deploy from a branch**, branch **main**, pasta **/ (root)**, e salve.
3. Depois de 1 ou 2 minutos, o app fica em `https://cristianssa.github.io/meu-organizador/`.

## Instalar no celular

- **Android (Chrome):** abra o link › menu ⋮ › **Instalar app** (ou "Adicionar à tela inicial").
- **iPhone (Safari):** abra o link › botão Compartilhar › **Adicionar à Tela de Início**.

## Seus dados

Os dados ficam **só no aparelho** (no navegador). Para não perder nada:

- Use **Planilha e backup › Baixar backup (.json)** de vez em quando.
- Para levar os dados para outro aparelho, baixe o backup em um e use **Importar backup** no outro.
- Opcional: ligue o espelho na planilha do Google (instruções no próprio app e em `apps-script/Codigo.gs`).

## Testar no computador

```bash
npx serve .
```

ou

```bash
python -m http.server 8080
```

e abra `http://localhost:8080`. (Abrir o `index.html` direto pelo explorador de arquivos funciona, mas sem o modo offline.)
