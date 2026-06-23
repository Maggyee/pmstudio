import next from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [".agents/**", "references/sources/**"],
  },
  ...next,
];

export default eslintConfig;
