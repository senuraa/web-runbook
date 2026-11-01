// The hook disables concurrency so formatting finishes before lint and length checks.
export default {
  '*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,json,jsonc,json5,yaml,yml,toml,css,scss,less,html,vue,md,mdx,graphql,gql}':
    'oxfmt --write --no-error-on-unmatched-pattern',
  '*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}': 'eslint --max-warnings=0 --no-warn-ignored',
  '*': 'node tools/check-line-length.mjs',
};
