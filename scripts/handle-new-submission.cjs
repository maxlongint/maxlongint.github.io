/**
 * 处理新提交的 Issue
 * 用于 GitHub Actions github-script
 */
module.exports = async ({ github, context }) => {
    await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        labels: ['待审核'],
    });

    await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body: '👋 感谢提交新工具!\n\n您的提交已收到,管理员会尽快审核。\n\n**审核流程:**\n- ⏳ 当前状态: 待审核\n- ✅ 审核通过后会自动添加到工具库\n- 📧 您会收到通知\n\n如有问题,请在评论中说明。',
    });

    console.log('✅ 新提交处理完成');
};
