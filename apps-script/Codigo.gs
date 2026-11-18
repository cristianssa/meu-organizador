/**
 * Meu Organizador – espelho na planilha.
 *
 * Como instalar (uma vez só):
 * 1. Crie uma planilha no Google Planilhas.
 * 2. Extensões › Apps Script. Apague o que estiver lá e cole este arquivo inteiro.
 * 3. Troque o texto da CHAVE abaixo por uma senha só sua. Salve.
 * 4. Implantar › Nova implantação › tipo "App da Web".
 *    Executar como: eu. Quem pode acessar: qualquer pessoa. Autorize.
 * 5. Copie a URL que termina em /exec e cole no app, em "Planilha e backup",
 *    junto com a mesma chave.
 *
 * Se mudar este código depois: Implantar › Gerenciar implantações › editar ›
 * Versão: "Nova versão" (assim a URL continua a mesma).
 */
var CHAVE = 'troque-esta-chave';

function doPost(e) {
  var out;
  try {
    var p = JSON.parse(e.postData.contents);
    if (CHAVE && p.key !== CHAVE) throw new Error('chave errada: use no app a mesma chave escrita no script');
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var opcionais = p.opt || [];
    var abas = {};
    Object.keys(p.rows || {}).forEach(function (nome) {
      var hdr = (p.hdr || {})[nome];
      var linhas = p.rows[nome] || [];
      if (!hdr) return;
      var sh = ss.getSheetByName(nome);
      if (!sh) {
        if (opcionais.indexOf(nome) >= 0 && !linhas.length) return;
        sh = ss.insertSheet(nome);
      }
      sh.clearContents();
      var dados = [hdr].concat(linhas).map(function (l) {
        var a = (l || []).slice(0, hdr.length);
        while (a.length < hdr.length) a.push('');
        return a;
      });
      sh.getRange(1, 1, dados.length, hdr.length).setValues(dados);
      sh.setFrozenRows(1);
      abas[nome] = linhas.length;
    });
    out = { ok: true, tabs: abas };
  } catch (err) {
    out = { ok: false, erro: String((err && err.message) || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

// Abrir a URL /exec no navegador mostra esta mensagem (serve para testar a implantação).
function doGet() {
  return ContentService.createTextOutput('Meu Organizador: script da planilha ativo.');
}
