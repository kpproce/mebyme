const { execSync } = require('child_process');

try {
    const commitMessage = execSync('git log -1 --pretty=%B').toString().trim();
    console.log(commitMessage);
} catch (error) {
    console.error('Failed to get commit message:', error);
    process.exit(1);
}
