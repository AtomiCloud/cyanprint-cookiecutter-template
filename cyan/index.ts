import { QuestionType, StartTemplateWithLambda } from "@atomicloud/cyan-sdk";
import simpleGit from "simple-git";
import * as fs from "fs";
import { v4 } from "uuid";

const git = simpleGit();
StartTemplateWithLambda(async (i, d) => {
  const url = await i.text("CookieCutter Git URL");

  const tmpPath = `/tmp/cookiecutter/${v4()}`;
  fs.mkdirSync(tmpPath, { recursive: true });

  git.clone(url, tmpPath);

  const cookieCutterJson = fs.readFileSync(
    `${tmpPath}/cookiecutter.json`,
    "utf-8",
  );

  const cookieCutter = JSON.parse(cookieCutterJson);

  const results: Record<string, string> = {};

  for (const [key, value] of Object.entries(cookieCutter)) {
    if (typeof value === "string") {
      if (
        [
          "1",
          "true",
          "t",
          "yes",
          "y",
          "on",
          "0",
          "false",
          "f",
          "no",
          "n",
          "off",
        ].includes(value.toLowerCase())
      ) {
        results[key] = (await i.confirm({
          type: QuestionType.Confirm,
          message: key,
        }))
          ? "true"
          : "false";
      } else {
        results[key] = await i.text({
          type: QuestionType.Text,
          message: key,
          default: value,
        });
      }
    } else if (Array.isArray(value)) {
      results[key] = await i.select(key, value);
    } else {
      throw new Error(`Unknown type ${typeof value}`);
    }
  }

  return {
    processors: [
      {
        name: "cyan/cookiecutter",
        files: [],
        config: {
          template: url,
          config: results,
        },
      },
    ],
    plugins: [],
  };
});
