/**
 * 处理收录成功后的 Issue 操作
 * 用于 GitHub Actions github-script
 */
module.exports = async ({ github, context, issueNumber }) => {
    // 移除所有旧标签
    try {
        const { data: issue } = await github.rest.issues.get({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: issueNumber,
        });

        // 移除所有现有标签
        for (const label of issue.labels) {
            await github.rest.issues.removeLabel({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issueNumber,
                name: label.name,
            });
        }
    } catch (error) {
        console.error('移除旧标签失败:', error.message);
    }

    // 添加"已收录"标签
    await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        labels: ['已收录'],
    });

    // 添加成功评论
    await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        body: '🎉 Tool added successfully!',
    });

    await github.rest.issues.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        state: 'closed',
    });

    console.log('✅ 收录成功处理完成');
};
