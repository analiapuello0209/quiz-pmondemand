// ════════════════════════════════════════════════════════════════════════
// PM On Demand · Tomando el Control · Apps Script
// ════════════════════════════════════════════════════════════════════════
//
// Sheet schema (1-indexed):
//   1.  timestamp           2.  type                3.  name
//   4.  role                5.  answers             6.  goal
//   7.  profile_primary     8.  profile_secondary   9.  monthly_cost
//   10. hrs_lost_day        11. hourly_rate         12. email
//   13. code                14. age_range           15. code_expires
//   16. unsubscribe_token   17. email_e0_sent_at    18. email_e1_sent_at
//   19. email_e2_sent_at    20. unsubscribed_at     21. wa_clicked_at
//
// Cols 20-21 las usarán los endpoints /pausar y /wa (tasks #15, #16) —
// por ahora quedan vacías y dailyEmailJob las trata como "no suprimido".
// ════════════════════════════════════════════════════════════════════════

// --- Constantes ---
const SENDER_NAME    = "Analía Puello · PM On Demand";
const BASE_URL       = "https://tupmondemand.com";
const CALENDLY_URL   = "https://calendly.com/analia-tupmondemand/30min";
const PDF_FOLDER_ID  = "1m3OQe9hv2baj5xBENzzD3romrG9exNqX";

// Días entre emails de la secuencia
const DAYS_BETWEEN_E0_E1 = 3;
const DAYS_BETWEEN_E1_E2 = 3;

// Subjects (se les prefija "{firstName}, ")
// AJUSTAR si quieres otro tono.
const SUBJECTS = {
  "e0": "tu resultado del quiz",
  "e1": "una pregunta",
  "e2": "lo último que te escribo",
};

// Map del nombre del perfil → archivo PDF en Drive (SOLO se adjunta en E0)
const PROFILE_PDF_MAP = {
  "Apagafuegos":         "01_Reporte Apagafuegos.pdf",
  "Todoterreno":         "02_Reporte Todoterreno.pdf",
  "Perfeccionista":      "03_Reporte Perfeccionista.pdf",
  "Multitasker":         "04_Reporte Multitasker.pdf",
  "Planificador Eterno": "05_Reporte Planificador.pdf",
  "Optimizador":         "06_Reporte Optimizador.pdf",
};

// Maps del nombre del perfil → nombre del archivo HTML en Apps Script (por stage)
const PROFILE_TEMPLATES = {
  "e0": {
    "Apagafuegos":         "email_e0_apagafuegos",
    "Todoterreno":         "email_e0_todoterreno",
    "Perfeccionista":      "email_e0_perfeccionista",
    "Multitasker":         "email_e0_multitasker",
    "Planificador Eterno": "email_e0_planificador",
    "Optimizador":         "email_e0_optimizador",
  },
  "e1": {
    "Apagafuegos":         "email_e1_apagafuegos",
    "Todoterreno":         "email_e1_todoterreno",
    "Perfeccionista":      "email_e1_perfeccionista",
    "Multitasker":         "email_e1_multitasker",
    "Planificador Eterno": "email_e1_planificador",
    "Optimizador":         "email_e1_optimizador",
  },
  "e2": {
    "Apagafuegos":         "email_e2_apagafuegos",
    "Todoterreno":         "email_e2_todoterreno",
    "Perfeccionista":      "email_e2_perfeccionista",
    "Multitasker":         "email_e2_multitasker",
    "Planificador Eterno": "email_e2_planificador",
    "Optimizador":         "email_e2_optimizador",
  },
};

// ════════════════════════════════════════════════════════════════════════
// doPost — Punto de entrada de POST desde el quiz
// ════════════════════════════════════════════════════════════════════════
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  if (data.type === "email_capture") {
    handleEmailCapture(sheet, data);
  } else if (data.type === "unsubscribe") {
    handleUnsubscribe(sheet, data.token);
  } else if (data.type === "wa_click") {
    handleWhatsAppClick(sheet, data.code, data.from);
  } else {
    handleQuizResult(sheet, data);
  }

  return ContentService.createTextOutput("ok");
}

// Marca wa_clicked_at en la fila cuyo code coincide. Llamado desde el JS
// embebido en public/wa.html cuando alguien clickea un link de WhatsApp desde
// un email E0/E2. Una vez marcado, dailyEmailJob suprime los siguientes
// envíos a esa persona (ya tuvo conversación abierta).
function handleWhatsAppClick(sheet, code, from) {
  if (!code) return;
  var rows = sheet.getDataRange().getValues();
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][12] === code) { // col 13 = code
      if (!rows[i][20]) { // col 21 = wa_clicked_at, no sobrescribir
        sheet.getRange(i + 1, 21).setValue(new Date().toISOString());
      }
      break;
    }
  }
  Logger.log("WA click: code=" + code + " from=" + (from || "-"));
}

// Marca unsubscribed_at en la fila cuyo unsubscribe_token coincide.
// Llamado desde el JS embebido en public/pausar.html via POST no-cors.
function handleUnsubscribe(sheet, token) {
  if (!token) return;
  var rows = sheet.getDataRange().getValues();
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][15] === token) { // col 16 = unsubscribe_token
      if (!rows[i][19]) { // col 20 = unsubscribed_at, no sobrescribir
        sheet.getRange(i + 1, 20).setValue(new Date().toISOString());
      }
      break;
    }
  }
}

// ════════════════════════════════════════════════════════════════════════
// doGet — GETs directos al Apps Script (legacy/diagnóstico, no usado en
// el flow actual porque /pausar es ahora una página estática en Netlify)
// ════════════════════════════════════════════════════════════════════════
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === "pausar") {
    return handlePausar(e.parameter.token);
  }
  return HtmlService.createHtmlOutput("<h1>404</h1>")
    .setTitle("Tomando el Control")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Marca unsubscribed_at en la fila cuyo unsubscribe_token coincide.
// Siempre devuelve la misma página de confirmación (aunque el token no exista
// o no coincida) — UX > paranoia.
function handlePausar(token) {
  if (token) {
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      var rows = sheet.getDataRange().getValues();
      for (var i = 0; i < rows.length; i++) {
        if (rows[i][15] === token) { // col 16 = unsubscribe_token
          if (!rows[i][19]) { // col 20 = unsubscribed_at, no sobrescribir
            sheet.getRange(i + 1, 20).setValue(new Date().toISOString());
          }
          break;
        }
      }
    } catch (err) {
      Logger.log("handlePausar error: " + err.message);
      // No re-tirar: queremos devolver la página de confirmación igual
    }
  }
  return HtmlService.createHtmlOutput(_pausarHtml())
    .setTitle("Tomando el Control")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function _pausarHtml() {
  return '<!DOCTYPE html>' +
'<html lang="es"><head>' +
'<meta charset="utf-8">' +
'<meta name="viewport" content="width=device-width, initial-scale=1">' +
'<title>Tomando el Control</title>' +
'<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text:ital@0;1&family=Rubik:wght@400;500;600&display=swap" rel="stylesheet">' +
'<style>' +
'  *{box-sizing:border-box}' +
'  body{font-family:"Rubik",sans-serif;background:#FAF7FD;color:#2D2944;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}' +
'  .card{background:#fff;max-width:480px;width:100%;padding:48px 36px 36px;border-radius:18px;text-align:center;box-shadow:0 4px 24px rgba(28,24,53,0.06);border:1px solid #E8E2F0}' +
'  h1{font-family:"DM Serif Text",serif;font-weight:400;font-size:28px;line-height:1.3;color:#2D2944;margin:0 0 8px}' +
'  .accent{color:#815DFF;font-style:italic}' +
'  p{font-size:15px;line-height:1.6;color:#686087;margin:16px 0 0}' +
'  .signature{margin-top:30px;font-family:"DM Serif Text",serif;font-style:italic;color:#815DFF;font-size:18px}' +
'  .footer{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9E73AB;margin-top:24px;padding-top:18px;border-top:1px solid #EFE8F1}' +
'</style></head><body>' +
'<div class="card">' +
'  <h1>Listo, no recibirás más correos<br><span class="accent">de esta secuencia</span>.</h1>' +
'  <p>Un abrazo.</p>' +
'  <div class="signature">Analía</div>' +
'  <div class="footer">PM On Demand</div>' +
'</div></body></html>';
}

// Inserta una fila nueva con el resultado del quiz
function handleQuizResult(sheet, data) {
  sheet.appendRow([
    data.timestamp,
    "quiz_result",
    data.name,
    data.role,
    data.answers,
    data.goal,
    data.profile_primary,
    data.profile_secondary,
    data.monthly_cost,
    data.hrs_lost_day,
    data.hourly_rate,
    data.email || "",      // 12 email opcional desde step 1
    "",                    // 13 code (se llena en email_capture)
    data.age_range || ""   // 14 age_range
  ]);
}

// Maneja la captura de email + dispara envío de E0 inmediato
function handleEmailCapture(sheet, data) {
  var rows = sheet.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 0; i--) {
    if (rows[i][2] === data.name) {
      var rowNum = i + 1;

      sheet.getRange(rowNum, 12).setValue(data.email);
      sheet.getRange(rowNum, 13).setValue(data.code);
      sheet.getRange(rowNum, 15).setValue(data.code_expires);

      var token = Utilities.getUuid();
      sheet.getRange(rowNum, 16).setValue(token);

      var profile = rows[i][6]; // col 7 = profile_primary

      try {
        sendEmailE0({
          name: data.name,
          email: data.email,
          code: data.code,
          code_expires: data.code_expires,
          profile: profile,
          unsubscribe_token: token,
        });
        sheet.getRange(rowNum, 17).setValue(new Date().toISOString());
      } catch (err) {
        Logger.log("Error sending E0: " + err.message + " | row " + rowNum + " | profile: " + profile);
      }

      break;
    }
  }
}

// ════════════════════════════════════════════════════════════════════════
// dailyEmailJob — Corre 1 vez/día por trigger time-based a las 9am Panamá.
// Recorre las filas, manda E1 a quien ya tiene E0 hace ≥3 días y E2 a
// quien ya tiene E1 hace ≥3 días. Suprime si unsubscribed_at o
// wa_clicked_at están seteados.
// ════════════════════════════════════════════════════════════════════════
function dailyEmailJob() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var now = new Date();
  var sent = { e1: 0, e2: 0, errors: 0 };

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    if (row[1] !== "quiz_result") continue; // solo filas del quiz

    var rowNum = i + 1;
    var email = row[11];
    var code = row[12];
    if (!email || !code) continue; // sin email_capture todavía

    // Supresión: unsubscribed o ya clickeó WA
    if (row[19] || row[20]) continue;

    var name        = row[2];
    var profile     = row[6];
    var codeExpires = row[14];
    var token       = row[15];
    var e0Sent      = row[16];
    var e1Sent      = row[17];
    var e2Sent      = row[18];

    var payload = {
      name: name, email: email, code: code,
      code_expires: codeExpires, profile: profile,
      unsubscribe_token: token,
    };

    // E1: ya hay E0, no hay E1, han pasado ≥3 días desde E0
    if (e0Sent && !e1Sent && _daysBetween(e0Sent, now) >= DAYS_BETWEEN_E0_E1) {
      try {
        sendEmailE1(payload);
        sheet.getRange(rowNum, 18).setValue(now.toISOString());
        sent.e1++;
      } catch (err) {
        Logger.log("E1 fail row " + rowNum + ": " + err.message);
        sent.errors++;
      }
    }
    // E2: ya hay E1, no hay E2, han pasado ≥3 días desde E1
    else if (e1Sent && !e2Sent && _daysBetween(e1Sent, now) >= DAYS_BETWEEN_E1_E2) {
      try {
        sendEmailE2(payload);
        sheet.getRange(rowNum, 19).setValue(now.toISOString());
        sent.e2++;
      } catch (err) {
        Logger.log("E2 fail row " + rowNum + ": " + err.message);
        sent.errors++;
      }
    }
  }

  Logger.log("dailyEmailJob: E1=" + sent.e1 + " E2=" + sent.e2 + " errors=" + sent.errors);
}

// ════════════════════════════════════════════════════════════════════════
// SEND FUNCTIONS — wrappers + helper compartido
// ════════════════════════════════════════════════════════════════════════
function sendEmailE0(d) { _sendEmailByStage("e0", d); }
function sendEmailE1(d) { _sendEmailByStage("e1", d); }
function sendEmailE2(d) { _sendEmailByStage("e2", d); }

function _sendEmailByStage(stage, d) {
  var templateName = PROFILE_TEMPLATES[stage][d.profile];
  if (!templateName) throw new Error("No template " + stage + " para perfil: " + d.profile);

  // Cargar HTML raw
  var html = HtmlService.createTemplateFromFile(templateName).getRawContent();

  // Variables para interpolar
  var firstName = (d.name || "").split(" ")[0] || d.name;
  var unsubscribeUrl = BASE_URL + "/pausar?token=" + encodeURIComponent(d.unsubscribe_token);
  var expiresFormatted = formatSpanishDate(d.code_expires);

  html = html
    .replace(/\{\{name\}\}/g, firstName)
    .replace(/\{\{code\}\}/g, d.code)
    .replace(/\{\{expires\}\}/g, expiresFormatted)
    .replace(/\{\{calendly_url\}\}/g, CALENDLY_URL)
    .replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl);

  // Adjuntar PDF SOLO en E0
  var attachments = [];
  if (stage === "e0") {
    var pdfFileName = PROFILE_PDF_MAP[d.profile];
    if (!pdfFileName) throw new Error("No PDF para perfil: " + d.profile);
    var folder = DriveApp.getFolderById(PDF_FOLDER_ID);
    var files = folder.getFilesByName(pdfFileName);
    if (!files.hasNext()) throw new Error("PDF no encontrado en Drive: " + pdfFileName);
    attachments.push(files.next().getBlob());
  }

  var subject = firstName + ", " + SUBJECTS[stage];
  GmailApp.sendEmail(d.email, subject, "", {
    name: SENDER_NAME,
    htmlBody: html,
    attachments: attachments,
  });
}

// ════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════

// "2026-05-29" → "29 de mayo"
function formatSpanishDate(yyyymmdd) {
  if (!yyyymmdd) return "";
  var months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  var parts = String(yyyymmdd).split("-");
  if (parts.length !== 3) return yyyymmdd;
  var day = parseInt(parts[2], 10);
  var monthIdx = parseInt(parts[1], 10) - 1;
  if (monthIdx < 0 || monthIdx > 11) return yyyymmdd;
  return day + " de " + months[monthIdx];
}

// Días enteros entre dos fechas/strings (redondea hacia abajo)
function _daysBetween(from, to) {
  var d1 = (from instanceof Date) ? from : new Date(from);
  var d2 = (to   instanceof Date) ? to   : new Date(to);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

// ════════════════════════════════════════════════════════════════════════
// FUNCIONES TEST — Ejecutar manualmente desde el editor (▶ TEST_*) para
// probar envíos sin necesidad de quiz real ni esperar 3 días.
// ════════════════════════════════════════════════════════════════════════
function TEST()    { sendEmailE0(_testPayload()); Logger.log("Test E0 enviado"); }
function TEST_E1() { sendEmailE1(_testPayload()); Logger.log("Test E1 enviado"); }
function TEST_E2() { sendEmailE2(_testPayload()); Logger.log("Test E2 enviado"); }
function TEST_DAILY() { dailyEmailJob(); }
function TEST_PAUSAR() {
  // Simula GET /pausar?token=<algún token existente del Sheet>
  // Reemplaza con un token real para probar que marca unsubscribed_at
  var output = doGet({ parameter: { action: "pausar", token: "test-token-12345" } });
  Logger.log("Pausar HTML preview (primeros 300 chars): " + output.getContent().substring(0, 300));
}

function _testPayload() {
  return {
    name: "Test Analía",
    email: "analia@tupmondemand.com",
    code: "TC-TST-0000",
    code_expires: "2026-06-02",
    profile: "Apagafuegos",
    unsubscribe_token: "test-token-12345",
  };
}
