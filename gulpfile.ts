import { compileFromFile } from "json-schema-to-typescript";
import path from "path";
import { writeFile } from "fs/promises";
import glob from "glob";
import gulp from 'gulp';

export async function buildSchema() {
  return new Promise<void>((res, rej) => {
    glob("*/schema.json", { cwd: "src" }, (e, files) => {
      files.forEach(async (file) => {
        const dir = path.dirname(file);
        var int = await compileFromFile(path.join("src", file));
        await writeFile(path.join("src", dir, "schema.ts"), int, {
          encoding: "utf-8",
        });
      });
      res();
    });
  });
}

export async function codeFormat() {
  //prettier.check()
}

export async function checkCodeFormat() {
  // var c = prettier.check('**');
  //console.log(c);
}

function watch() {
  return gulp.watch("src/*/schema.json", buildSchema);
}


exports.default = watch;
