const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const classReplacements = [
  { regex: /border-border-muted\/50/g, to: 'border-border-muted' },
  { regex: /border-border-muted\/20/g, to: 'border-border-muted' },
  { regex: /bg-background\/40/g, to: 'bg-background/80' },
  { regex: /bg-background\/60/g, to: 'bg-background/90' },
  { regex: /text-foreground\/50/g, to: 'text-foreground/80' }, // Increase contrast even more
  { regex: /text-muted-foreground\/50/g, to: 'text-muted-foreground/80' },
  { regex: /text-muted-foreground\/60/g, to: 'text-muted-foreground/90' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const rep of classReplacements) {
        if (content.match(rep.regex)) {
          content = content.replace(rep.regex, rep.to);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(dir);
console.log('Done pass 2.');
