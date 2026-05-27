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
//   16. unsubscribe_token   17. email_e0_sent_at
//
// Columnas para E1/E2/WhatsApp tracking (tasks #14-16) vendrán a la
// derecha (18+) cuando se implementen.
// ════════════════════════════════════════════════════════════════════════

// --- Constantes ---
const SENDER_NAME    = "Analía Puello · PM On Demand";
const BASE_URL       = "https://tupmondemand.com";
const CALENDLY_URL   = "https://calendly.com/analia-tupmondemand/30min";
const PDF_FOLDER_ID  = "1m3OQe9hv2baj5xBENzzD3romrG9exNqX";

// Map del nombre del perfil (como viene del quiz) → archivo PDF en Drive
const PROFILE_PDF_MAP = {
  "Apagafuegos":         "01_Reporte Apagafuegos.pdf",
  "Todoterreno":         "02_Reporte Todoterreno.pdf",
  "Perfeccionista":      "03_Reporte Perfeccionista.pdf",
  "Multitasker":         "04_Reporte Multitasker.pdf",
  "Planificador Eterno": "05_Reporte Planificador.pdf",
  "Optimizador":         "06_Reporte Optimizador.pdf",
};

// Map del nombre del perfil → nombre del archivo HTML del template E0 en Apps Script
const PROFILE_TEMPLATE_MAP = {
  "Apagafuegos":         "email_e0_apagafuegos",
  "Todoterreno":         "email_e0_todoterreno",
  "Perfeccionista":      "email_e0_perfeccionista",
  "Multitasker":         "email_e0_multitasker",
  "Planificador Eterno": "email_e0_planificador",
  "Optimizador":         "email_e0_optimizador",
};

// ════════════════════════════════════════════════════════════════════════
// doPost — Punto de entrada de POST desde el quiz
// ════════════════════════════════════════════════════════════════════════
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  if (data.type === "email_capture") {
    handleEmailCapture(sheet, data);
  } else {
    handleQuizResult(sheet, data);
  }

  return ContentService.createTextOutput("ok");
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

// Maneja la captura de email + dispara envío de E0
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
// sendEmailE0 — Carga template, interpola variables, envía con PDF adjunto
// ════════════════════════════════════════════════════════════════════════
function sendEmailE0(d) {
  var templateName = PROFILE_TEMPLATE_MAP[d.profile];
  if (!templateName) throw new Error("No template E0 para perfil: " + d.profile);

  var pdfFileName = PROFILE_PDF_MAP[d.profile];
  if (!pdfFileName) throw new Error("No PDF para perfil: " + d.profile);

  // Cargar HTML raw del archivo template del proyecto Apps Script
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

  // PDF adjunto desde Drive
  var folder = DriveApp.getFolderById(PDF_FOLDER_ID);
  var files = folder.getFilesByName(pdfFileName);
  if (!files.hasNext()) throw new Error("PDF no encontrado en Drive: " + pdfFileName);
  var pdfBlob = files.next().getBlob();

  // Enviar (sale desde la cuenta dueña del script: analia@tupmondemand.com)
  var subject = firstName + ", tu resultado del quiz";
  GmailApp.sendEmail(d.email, subject, "", {
    name: SENDER_NAME,
    htmlBody: html,
    attachments: [pdfBlob],
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

// ════════════════════════════════════════════════════════════════════════
// TEST — Ejecútala manualmente desde el editor (botón ▶ "TEST") para
// enviarte un E0 de prueba SIN tener que hacer un quiz real.
// La primera vez Google te pedirá autorizar permisos de Gmail + Drive.
// ════════════════════════════════════════════════════════════════════════
function TEST() {
  sendEmailE0({
    name: "Test Analía",
    email: "analia@tupmondemand.com",  // a ti misma
    code: "TC-TST-0000",
    code_expires: "2026-06-02",
    profile: "Apagafuegos",
    unsubscribe_token: "test-token-12345",
  });
  Logger.log("Test E0 enviado a analia@tupmondemand.com");
}
