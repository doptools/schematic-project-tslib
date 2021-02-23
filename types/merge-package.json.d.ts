
declare module 'merge-package.json' {
    import type { PackageJson } from "type-fest";
    export default function (current: string, from: string, to: string): string;
}

