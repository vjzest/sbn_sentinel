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

const colorMap = [
  { regex: /#4F46E5/ig, replacement: '#6D5DF6' }, // Primary to Royal Purple
  { regex: /#4338CA/ig, replacement: '#5B4AE8' }, // Primary Hover
  { regex: /indigo-600/ig, replacement: '[#6D5DF6]' },
  { regex: /indigo-700/ig, replacement: '[#5B4AE8]' },
  { regex: /indigo-50/ig, replacement: '[#EEEAFE]' },
  { regex: /indigo-100/ig, replacement: '[#E0D9FD]' },
  { regex: /#F9FAFB/ig, replacement: '#F7F9FC' }, // Background
  { regex: /rounded-\[12px\]/ig, replacement: 'rounded-[16px]' }, // Button radius
  { regex: /rounded-xl/ig, replacement: 'rounded-2xl' },
];

walk(directory, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    colorMap.forEach(map => {
      content = content.replace(map.regex, map.replacement);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated theme in ${filePath}`);
    }
  }
});
