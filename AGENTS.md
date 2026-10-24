<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Resolve hosting credential names through the browser-safe provider-config module, with supplied OpenAI credentials taking precedence; this keeps deployment behavior consistent and testable without accessing real secrets in tests.
- Keep model selection in provider-config and do not accept environment model overrides, so every hosting path enforces the same model policy.
