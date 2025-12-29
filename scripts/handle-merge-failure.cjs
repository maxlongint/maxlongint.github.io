/**
 * 处理收录失败后的 Issue 操作
 * 用于 GitHub Actions github-script
 */
module.exports = async ({ github, context, issueNumber, runUrl }) => {
    await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        body: `❌ 自动收录失败！

**错误原因**：请查看 [GitHub Actions 日志](${runUrl})

**解决方案**：
1. 检查工具信息是否正确
2. 确认 GitHub 仓库是否可访问
3. 请手动重试或联系维护者

ℹ️ 没有任何数据被提交，请放心重试。`,
    });

    await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        labels: ['收录失败'],
    });

    console.log('✅ 收录失败处理完成');
};
