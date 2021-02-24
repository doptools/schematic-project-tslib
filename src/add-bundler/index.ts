import {
    apply,
    chain,
    mergeWith,
    renameTemplateFiles,
    Rule,
    SchematicContext,
    template,
    Tree,
    url
} from "@angular-devkit/schematics";
import { AddWebBundlerOptions } from "./schema";
import versions from "../versions.json";
import { PackageJsonUtil } from "@doptools/schematic-project-base";
import { jsonc } from "jsonc";

export default function (options: AddWebBundlerOptions): Rule {

    const partials = apply(url("./files.partial"), [
        template({
            ...options,
            dot: ".",
            versions
        }),
        renameTemplateFiles()
    ]);

    return chain([
        async (_: Tree, context: SchematicContext) => {
            context.logger.info('Adding web bundler');
        },
        mergeWith(
            apply(url("./files"), [
                template({
                    ...options,
                    dot: ".",
                    versions
                }),
                renameTemplateFiles()
            ])
        ),
        async (host: Tree, context: SchematicContext) => {
            context.logger.info('Adding bundler to package.json');
            const tplFiles = await (partials(context) as any).toPromise();
            const hostPkgSrc = host.read('package.json')?.toString('utf-8')!;
            const tplPkgSrc = tplFiles.read('package.json')?.toString('utf-8')!;
            const merged = PackageJsonUtil.merge(hostPkgSrc, tplPkgSrc);
            host.overwrite('package.json', merged);
        }
    ]);
}
