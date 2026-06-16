import next from "eslint-config-next";

const eslintConfig = [
  {
    ignores: ["references/sources/**"],
  },
  ...next,
];

export default eslintConfig;
