const fs = require('fs');

/**
 * 检查提交的工具是否已存在于 bookmarks.json 中
 * @param {string} issueBody - Issue 正文内容
 * @returns {Object} { isDuplicate: boolean, existingTitle: string, githubUrl: string }
 */
function checkDuplicateSubmission(issueBody) {
  const result = {
    isDuplicate: false,
    existingTitle: '',
    githubUrl: ''
  };

  // 从 Issue 正文中提取 GitHub URL
  const urlMatch = issueBody.match(/(?:github\.com\/|https:\/\/github\.com\/)([^\s\)\]"']+)/i);
  
  if (!urlMatch) {
    console.log('⚠️ 未找到 GitHub URL');
    return result;
  }

  result.githubUrl = urlMatch[0];
  
  try {
    // 读取 bookmarks.json 文件
    const bookmarksData = JSON.parse(fs.readFileSync('src/data/bookmarks.json', 'utf8'));
    const submittedUrl = urlMatch[0].toLowerCase().replace(/\/$/, '');
    
    // 检查是否已存在
    for (const bookmark of bookmarksData.bookmarks) {
      const existingUrl = (bookmark.url || '').toLowerCase().replace(/\/$/, '');
      if (existingUrl.includes(submittedUrl) || submittedUrl.includes(existingUrl.replace('https://github.com/', ''))) {
        result.isDuplicate = true;
        result.existingTitle = bookmark.title;
        console.log(`❌ 检测到重复提交: ${bookmark.title}`);
        break;
      }
    }
    
    if (!result.isDuplicate) {
      console.log('✅ 未检测到重复');
    }
  } catch (error) {
    console.error('⚠️ 无法读取或解析 bookmarks.json:', error.message);
  }

  return result;
}

// 导出函数
module.exports = { checkDuplicateSubmission };

// 如果直接运行此脚本，从环境变量获取参数
if (require.main === module) {
  const issueBody = process.env.ISSUE_BODY || '';
  const result = checkDuplicateSubmission(issueBody);
  
  // 输出结果供 GitHub Actions 使用
  console.log(JSON.stringify(result));
  
  process.exit(result.isDuplicate ? 1 : 0);
}
