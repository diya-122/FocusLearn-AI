const fs = require('fs');
const src = 'C:\\Users\\DIYA AGARWAL\\.gemini\\antigravity-ide\\brain\\d68f8f31-1d1f-4e12-b5ca-af42d07d3222\\ai_robot_1783765648701.png';
const dest = 'c:\\Users\\DIYA AGARWAL\\OneDrive\\Desktop\\iit\\frontend\\public\\robot.png';
fs.copyFileSync(src, dest);
console.log('Copied robot.png to public/');
