import { strings } from "@angular-devkit/core";
import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  template,
  renameTemplateFiles,
  url
} from "@angular-devkit/schematics";
import { BaseProjectOptions } from "./schema";
import versions from "../versions.json";
import { posix as Path } from 'path';


export default function (options: BaseProjectOptions): Rule {

  let name = options.name;
  let scope = '';
  if (name.startsWith('@')) {
    const p = name.split('/', 2);
    scope = p[0].substring(1);
    name = strings.dasherize(p[1]);

  }
  
  const packageName = (scope ? `@${scope}/` : '') + name;

  return chain([
    mergeWith(
      apply(url("./files"), [
        template({
          ...strings,
          ...options,
          packageName,
          name,
          scope,
          dot: ".",
          versions,
        }),
        renameTemplateFiles()
      ])
    )
  ]);
}
