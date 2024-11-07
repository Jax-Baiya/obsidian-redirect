// obsidian.d.ts

declare module 'obsidian' {
    // Import core elements from Obsidian's API here
    export class Plugin {
        app: App;
        onload(): void;
        onunload(): void;
        registerMarkdownPostProcessor(callback: (el: HTMLElement, ctx: MarkdownPostProcessorContext) => void): void;
        addCommand(command: Command): Command;
        addSettingTab(tab: PluginSettingTab): void;
        addRibbonIcon(icon: string, title: string, callback: (evt: MouseEvent) => void): HTMLElement;
        loadData(): Promise<any>;
        saveData(data: any): Promise<void>;
    }

    export class App {
        workspace: Workspace;
        vault: Vault;
    }

    export class Workspace {
        getActiveFile(): TFile | null;
    }

    export class Vault {
        getName(): string;
    }

    export class TFile {
        path: string;
        name: string;
    }

    export interface MarkdownPostProcessorContext {}

    export class PluginSettingTab {
        containerEl: HTMLElement;
        constructor(app: App, plugin: Plugin);
    }

    export class Setting {
        constructor(containerEl: HTMLElement);
        setName(name: string): this;
        setDesc(desc: string): this;
        addText(callback: (text: TextComponent) => void): this;
        addToggle(callback: (toggle: ToggleComponent) => void): this;
        addDropdown(callback: (dropdown: DropdownComponent) => void): this;
    }

    export class TextComponent {
        setPlaceholder(placeholder: string): this;
        setValue(value: string): this;
        onChange(callback: (value: string) => void): this;
    }

    export class ToggleComponent {
        setValue(value: boolean): this;
        onChange(callback: (value: boolean) => void): this;
    }

    export class DropdownComponent {
        addOption(value: string, display: string): this;
        setValue(value: string): this;
        onChange(callback: (value: string) => void): this;
    }

    export class Notice {
        constructor(message: string);
    }

    export class Modal {
        app: App;
        contentEl: HTMLElement;
        constructor(app: App);
        open(): void;
        close(): void;
    }

    export class ButtonComponent {
        constructor(containerEl: HTMLElement);
        setButtonText(text: string): this;
        onClick(callback: () => void): this;
    }

    export interface Command {
        id: string;
        name: string;
        callback: () => void;
    }
}