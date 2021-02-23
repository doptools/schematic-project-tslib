import { strings } from "@angular-devkit/core";
import {
    apply,
    chain,
    empty,
    externalSchematic, mergeWith,
    move,
    Rule,
    schematic,
    SchematicContext,
    Tree
} from "@angular-devkit/schematics";
import { BaseProjectOptions } from '@doptools/schematic-project-base';
import { TsLibProjectOptions } from "../project/schema";
import { NewTsLibProjectOptions } from "./schema";
import {
    NodePackageInstallTask,
    RepositoryInitializerTask,
} from "@angular-devkit/schematics/tasks";

export default function (options: NewTsLibProjectOptions): Rule {
    if (!options.directory) {
        if (options.name.startsWith('@')) {
            options.directory = strings.dasherize(options.name.split('/')[1]);
        } else {
            options.directory = strings.dasherize(options.name);
        }
    }

    const baseOptions: TsLibProjectOptions = {
        ...options
    };

    //const packageName = (scope ? `@${scope}/` : '') + name;

    return chain([
        mergeWith(
            apply(empty(), [
                schematic("project", baseOptions),
                move(options.directory),
            ])
        ),

        (_host: Tree, context: SchematicContext) => {
            let packageTask;
            if (!options.skipInstall) {
                packageTask = context.addTask(
                    new NodePackageInstallTask({
                        workingDirectory: options.directory,
                        packageManager: "yarn",
                    })
                );
            }
            if (!options.skipGit) {
                const commit =
                    typeof options.commit == "object"
                        ? options.commit
                        : !!options.commit
                            ? {}
                            : false;

                context.addTask(
                    new RepositoryInitializerTask(options.directory, commit),
                    packageTask ? [packageTask] : []
                );
            }
        },
    ]);
}
