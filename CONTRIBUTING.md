<br>


# Hi! 
<br>
Welcome to work! ("issues")

### https://github.com/code-charity/youtube/wiki/Contributing
you can also just check the (pinned-)issues(, readme & discussion, wiki, ..)  <br><br>
### Thanks for caring ♥

## GitHub Actions Workflow for Closing Stale Issues

We have implemented a GitHub Actions workflow to automatically close stale issues. This helps in keeping the issue tracker clean and focused on active issues.

The workflow is defined in the `.github/workflows/stale.yml` file. It uses the `actions/stale@v4` action to automatically close issues that have been inactive for a specified period. The configuration is as follows:

- `days-before-stale`: 30 days
- `days-before-close`: 7 days
- Excludes issues with the `pinned` or `security` labels from being marked as stale

For more details, refer to the [GitHub documentation on closing inactive issues](https://docs.github.com/en/actions/use-cases-and-examples/project-management/closing-inactive-issues).

## Pull Request Template

We have added a pull request template to ensure that an issue is closed if a pull request is merged. This helps in keeping the issue tracker up-to-date with the latest changes.

The template is defined in the `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md` file. It includes verbiage like "This pull request closes #ISSUE_NUMBER" to ensure that an issue is closed when the pull request is merged.

For more details, refer to the [GitHub documentation on using keywords in issues and pull requests](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/using-keywords-in-issues-and-pull-requests).
