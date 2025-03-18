const fs = require('fs');
const path = require('path');

console.log('Checking build directory structure...');

const buildDir = path.join(__dirname, 'frontend', 'build');

try {
  // Check if build directory exists
  if (fs.existsSync(buildDir)) {
    console.log('✅ Build directory exists');
    
    // Check for index.html
    const indexPath = path.join(buildDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('✅ index.html exists');
    } else {
      console.error('❌ index.html is missing!');
    }
    
    // Check for static directory
    const staticDir = path.join(buildDir, 'static');
    if (fs.existsSync(staticDir)) {
      console.log('✅ static directory exists');
    } else {
      console.error('❌ static directory is missing!');
    }
    
    // List files in build directory
    console.log('\nFiles in build directory:');
    const files = fs.readdirSync(buildDir);
    files.forEach(file => {
      console.log(`- ${file}`);
    });
    
  } else {
    console.error('❌ Build directory is missing!');
  }
} catch (err) {
  console.error('Error checking build:', err);
}