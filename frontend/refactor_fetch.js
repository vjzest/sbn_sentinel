const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (fullPath.includes('fetchWithAuth.ts') || fullPath.includes('AuthScreen.tsx') || fullPath.includes('AuthScreen.tsx.backup')) continue;

      if (content.includes('fetch(') || content.includes('fetch (')) {
        if (!content.includes('fetchWithAuth')) {
           const importRegex = /import .* from .*\n/g;
           let lastMatch = null;
           let match;
           while ((match = importRegex.exec(content)) !== null) {
               lastMatch = match;
           }
           const importStmt = "import { fetchWithAuth } from '@/utils/fetchWithAuth';\n";
           if (lastMatch) {
               const idx = lastMatch.index + lastMatch[0].length;
               content = content.slice(0, idx) + importStmt + content.slice(idx);
           } else {
               content = importStmt + content;
           }
        }
        
        content = content.replace(/\bfetch\s*\(/g, 'fetchWithAuth(');
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + fullPath);
      }
    }
  }
}

processDir('./src/components/CommandCenter');
processDir('./src/app/dashboard');
