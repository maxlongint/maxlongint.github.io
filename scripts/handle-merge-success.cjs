/**
 * 处理收录成功后的 Issue 操作
 * 用于 GitHub Actions github-script
 */
module.exports = async ({ github, context, issueNumber }) => {
    await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        body: '🎉 Tool added successfully!',
    });

    await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        labels: ['已收录'],
    });

    await github.rest.issues.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        state: 'closed',
    });

    console.log('✅ 收录成功处理完成');
};
