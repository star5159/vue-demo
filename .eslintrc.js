module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'//禁用对vue的eslint语法检查
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "vue/script-indent": ["error", 2, {  // script标签缩进设置
      "baseIndent": 1,
      "switchCase": 0,
      "ignores": [],
    }],
    "no-useless-return": 0
  },
  overrides: [
    {
      "files": ["*.vue"],
      "rules": {
        "indent": "off",
      }
    }
  ],
}
