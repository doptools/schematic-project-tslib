import {
  apply,
  chain,
  empty,
  externalSchematic, MergeStrategy, mergeWith,
  Rule,
  SchematicContext,
  Tree,
  template,
  url,
  renameTemplateFiles
} from "@angular-devkit/schematics";
import { BaseProjectOptions, PackageJsonUtil } from '@doptools/schematic-project-base';
import { TsLibProjectOptions } from "./schema";
import { EditorConfig } from '@doptools/schematic-project-base';
import { jsonc } from 'jsonc';
import { ObservableLike, PackageJson } from 'type-fest';
import versions from "../versions.json";
import mergePackageJson from 'merge-package.json';

export default function (options: TsLibProjectOptions): Rule {

  const baseOptions: BaseProjectOptions = {
    name: options.name,
    description: options.description,
    private: options.private,
    repository: options.repository
  };

  const partials = apply(url("./files.partial"), [
    template({
      dot: ".",
      versions
    }),
    renameTemplateFiles()
  ]);

  return chain([
    mergeWith(
      apply(empty(), [
        externalSchematic("@doptools/schematic-project-base", "project", baseOptions),
      ]),
    ),
    mergeWith(
      apply(url("./files"), [
        template({
          dot: ".",
          versions
        }),
        renameTemplateFiles()
      ])
    ),
    async (host: Tree, context: SchematicContext) => {
      const tplFiles = await (partials(context) as any).toPromise();
      const hostEditorConfig = EditorConfig.parse(host.read('.editorconfig')?.toString('utf-8')!);
      const tsEditorConfig = EditorConfig.parse(tplFiles.read('.editorconfig')?.toString('utf-8')!);
      const newEditorConfig = {
        ...hostEditorConfig,
        ...tsEditorConfig
      };
      const newEcStr = EditorConfig.stringify(newEditorConfig);
      host.overwrite('.editorconfig', newEcStr);
    },
    async (host: Tree, context: SchematicContext) => {
      const tplFiles = await (partials(context) as any).toPromise();
      const hostPkg = host.read('package.json')?.toString('utf-8')!;
      const tplPkg = tplFiles.read('package.json')?.toString('utf-8')!;
      const merged = PackageJsonUtil.merge(hostPkg, tplPkg);
      host.overwrite('package.json', merged);
    }
  ]);
}
