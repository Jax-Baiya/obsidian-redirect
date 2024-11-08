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
        registerEvent(eventRef: EventRef): void;
    }

    export class App {
        workspace: Workspace;
        vault: Vault;
        metadataCache: MetadataCache; // Add metadataCache property
    }

    export class Workspace {
        getActiveFile(): TFile | null;

        // Add the 'on' method to listen for events like 'file-menu'
        on(name: 'file-menu', callback: (menu: Menu, file: TFile) => void): EventRef;
        // ...other event methods if needed
    }

    export class Vault {
        getName(): string;
        on(name: string, callback: (file: TAbstractFile) => void): EventRef;
        read(file: TFile): Promise<string>;
        modify(file: TFile, data: string): Promise<void>;
    }

    export class MetadataCache {
        getFileCache(file: TFile): CachedMetadata | null; // Add getFileCache method
    }

    export class TFile extends TAbstractFile {
        path: string;
        name: string;
    }

    export class TAbstractFile {}

    export interface CachedMetadata {
        frontmatter?: Record<string, any>;
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
        constructor(containerEl: HTMLElement);
        addOption(value: string, display: string): this;
        setValue(value: string): this;
        getValue(): string;
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

    export class EventRef {}

    // Define the 'Menu' class used in the 'file-menu' event
    export class Menu {
        addItem(callback: (item: MenuItem) => void): void;
        // ...other methods if needed
    }

    // Define the 'MenuItem' class used to add items to the menu
    export class MenuItem {
        setTitle(title: string): this;
        setIcon(icon: string): this;
        onClick(callback: () => void): this;
        // ...other methods if needed
    }
}

// Extend HTMLElement with Obsidian's additional methods
declare global {
    interface HTMLElement {
        addClass(className: string): void;
        removeClass(cls: string): this;
        toggleClass(cls: string, toggle?: boolean): this;
        hasClass(cls: string): boolean;
        empty(): void;
        createEl<K extends keyof HTMLElementTagNameMap>(
            tagName: K,
            options?: {
                text?: string;
                cls?: string;
                attr?: Record<string, string>;
                type?: string;
            }
        ): HTMLElementTagNameMap[K];
    }
}