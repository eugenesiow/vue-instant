module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  env: {
    browser: true,
  },
  // add your custom rules here
  'rules': {
    "no-tabs": 0,
    "no-mixed-spaces-and-tabs": 0,
    "indent":0,
    "semi":0,
    "no-trailing-spaces":0,
    "space-in-parens":0,
    "quotes":0,
    "no-multi-spaces":0,
    "padded-blocks":0,
    "space-before-function-paren":0,
    "brace-style":0,
    "no-multiple-empty-lines":0,
  }
}
