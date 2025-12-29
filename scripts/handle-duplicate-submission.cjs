/**
 * 处理重复提交的 Issue
 * 用于 GitHub Actions github-script
 */
module.exports = async ({ github, context, existingTitle }) => {
    await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        labels: ['重复收录'],
    });

    await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body: `❌ **重复提交**

您提交的工具库已存在于我们的收录列表中。

**已存在的工具:** ${existingTitle}

感谢您的关注！如果您认为这是误判，请在评论中说明。`,
    });

    await github.rest.issues.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        state: 'closed',
    });

    console.log('✅ 重复提交处理完成');
};
