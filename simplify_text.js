const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'frontend/src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const textMap = [
  { regex: /\bSignals Hub\b/g, replacement: 'Activity Inbox' },
  { regex: /\bReality Sources\b/g, replacement: 'Connections' },
  { regex: /\bPatient Flow\b/g, replacement: 'Patient Waitlist' },
  { regex: /\bSchedule Optimizer\b/g, replacement: 'Calendar' },
  { regex: /\bClinical Logs\b/g, replacement: 'Patient Records' },
  { regex: /\bRevenue Reports\b/g, replacement: 'Billing & Revenue' },
  { regex: /\bIntelligence Layer\b/g, replacement: 'AI Assistant' },
  { regex: /\bFHIR PAYLOAD\b/ig, replacement: 'SYSTEM LOGS' },
  { regex: /\bFHIR\b/g, replacement: 'Secure Data' },
  { regex: /\bJSON Viewer\b/g, replacement: 'System View' },
  { regex: /\bPayload Viewer\b/g, replacement: 'Detailed Logs' },
  { regex: /\bWebhook\b/g, replacement: 'Integration' },
  { regex: /\bINTEGRATION DIAGNOSTICS\b/g, replacement: 'SYSTEM STATUS' }
];

walk(directory, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    textMap.forEach(map => {
      content = content.replace(map.regex, map.replacement);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated terminology in ${filePath}`);
    }
  }
});
