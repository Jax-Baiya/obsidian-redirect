import { App, Plugin, PluginSettingTab, Setting, Notice, Modal, ButtonComponent, TFile, DropdownComponent, TAbstractFile, Menu, MenuItem } from 'obsidian';
import { v4 as uuidv4 } from 'uuid';

interface CustomUriRedirectSettings {
  redirectDomain: string;
  useVaultName: boolean;
  useVaultID: boolean;
  useNoteName: boolean;
  useNoteUID: boolean;
}

const DEFAULT_SETTINGS: CustomUriRedirectSettings = {
  redirectDomain: 'https://jax-baiya.github.io/obsidian-redirect',
  useVaultName: true,
  useVaultID: false,
  useNoteName: true,
  useNoteUID: false,
};

export default class CustomUriRedirectPlugin extends Plugin {
  settings: CustomUriRedirectSettings = DEFAULT_SETTINGS; // Initialize settings

  async onload() {
    console.log('Loading Custom URI Redirect Plugin');
    await this.loadSettings();

    try {
      this.registerMarkdownPostProcessor(this.processCustomUriLinks.bind(this));
    } catch (error) {
      console.error('Error during Markdown post-processing registration:', error);
    }
    if (this.app) {
      console.log('Adding settings tab');
      this.addSettingTab(new CustomUriRedirectSettingTab(this.app, this));
    }
    this.addCommand({
      id: 'generate-custom-uri-link',
      name: 'Generate Custom URI Link',
      callback: () => {
        console.log('Command executed: Generate Custom URI Link');
        new LinkGeneratorModal(this.app, this).open();
      },
    });

    // Add a ribbon icon to the Obsidian UI
    const ribbonIconEl = this.addRibbonIcon('link', 'Generate Custom URI Link', (evt: MouseEvent) => {
      new LinkGeneratorModal(this.app, this).open();
    });
    ribbonIconEl.addClass('custom-uri-redirect-plugin-ribbon');

    // Register event to create UID in frontmatter when a new note is created
    this.registerEvent(this.app.vault.on('create', this.onCreateFile.bind(this)));

    // Add option to "More Options" menu
    this.registerEvent(this.app.workspace.on('file-menu', (menu: Menu, file: TFile) => {
      this.addMoreOptionsMenu(menu, file);
    }));
  }

  onunload() {
    console.log('Unloading Custom URI Redirect Plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private async onCreateFile(file: TAbstractFile) {
    if (!(file instanceof TFile)) {
      return;
    }
    const fileContent = await this.app.vault.read(file);
    const frontmatter = this.extractFrontmatter(fileContent);
    if (!frontmatter.uid) {
      frontmatter.uid = uuidv4();
      const updatedContent = this.updateFrontmatter(fileContent, frontmatter);
      await this.app.vault.modify(file, updatedContent);
    }
  }

  private extractFrontmatter(content: string): any {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      return this.parseYaml(frontmatterMatch[1]);
    }
    return {};
  }

  private updateFrontmatter(content: string, frontmatter: any): string {
    const frontmatterString = this.stringifyYaml(frontmatter);
    if (content.startsWith('---\n')) {
      return content.replace(/^---\n[\s\S]*?\n---/, `---\n${frontmatterString}\n---`);
    } else {
      return `---\n${frontmatterString}\n---\n${content}`;
    }
  }

  private parseYaml(yamlString: string): any {
    // Implement YAML parsing logic (e.g., using a library like js-yaml)
    return {}; // Placeholder implementation
  }

  private stringifyYaml(jsonObject: any): string {
    // Implement YAML stringification logic (e.g., using a library like js-yaml)
    return ''; // Placeholder implementation
  }

  public processCustomUriLinks(el: HTMLElement, ctx: any) {
    console.log('Processing custom URI links');
    const links = el.querySelectorAll('div a[href^="obsidian:"]');
    console.log(`Found ${links.length} Obsidian URI links`);

    links.forEach((link) => {
      const href = link.getAttribute('href');
      console.log(`Processing link: ${href}`);

      if (href) {
        let notionUrl = '';

        if (href.startsWith('obsidian://open')) {
          const params = new URLSearchParams(href.replace('obsidian://open?', ''));
          params.set('newpane', 'true'); // Use 'newpane' for Obsidian URIs
          const vault = params.get('vault');
          const file = params.get('file');

          if (vault && file) {
            notionUrl = `${this.settings.redirectDomain}/?path=obsidian-open&vault=${encodeURIComponent(vault)}&file=${encodeURIComponent(file)}&newpane=true`;
            console.log(`Generated Notion URL for obsidian://open: ${notionUrl}`);
          }
        } else if (href.startsWith('obsidian://adv-uri')) {
          const params = new URLSearchParams(href.replace('obsidian://adv-uri?', ''));
          params.set('newpane', 'true'); // Use 'newpane' for Obsidian URIs
          const vault = params.get('vault');
          const uid = params.get('uid');
          const filepath = params.get('filepath');

          if (vault && uid && filepath) {
            notionUrl = `${this.settings.redirectDomain}/?path=obsidian-adv-uri&vault=${encodeURIComponent(vault)}&uid=${encodeURIComponent(uid)}&filepath=${encodeURIComponent(filepath)}&newpane=true`;
            console.log(`Generated Notion URL for obsidian://adv-uri: ${notionUrl}`);
          }
        }

        if (notionUrl) {
          link.setAttribute('href', notionUrl);
          link.textContent = `Redirected to: ${notionUrl}`;
          console.log(`Converted link to: ${notionUrl}`);
        }
      }
    });
  }

  public async generateLinkForCurrentNote(linkFormat: string) {
    console.log('Attempting to generate link for current note');
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      const vaultName = this.app.vault.getName();
      const filePath = activeFile.path;
      const noteUID = await this.ensureNoteUID(activeFile);
      const fileName = activeFile.name;

      let notionUrl = '';
      if (this.settings.useNoteUID) {
        notionUrl = `${this.settings.redirectDomain}/?path=obsidian-open&vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(noteUID)}&newpane=true`;
      } else {
        notionUrl = `${this.settings.redirectDomain}/?path=obsidian-open&vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(filePath)}&newpane=true`;
      }

      if (linkFormat === 'name') {
        new Notice(`Generated Link: [${fileName}](${notionUrl})`);
        console.log(`Generated Link: [${fileName}](${notionUrl})`);
        await navigator.clipboard.writeText(`[${fileName}](${notionUrl})`);
      } else {
        new Notice(`Generated Link: ${notionUrl}`);
        console.log(`Generated Link: ${notionUrl}`);
        await navigator.clipboard.writeText(notionUrl);
      }
      new Notice('Link copied to clipboard');
    } else {
      new Notice('No active note found to generate the link.');
      console.log('No active note found to generate the link');
    }
  }

  private async ensureNoteUID(file: TFile): Promise<string> {
    const fileContent = await this.app.vault.read(file);
    const frontmatter = this.extractFrontmatter(fileContent);
    if (!frontmatter.uid) {
      frontmatter.uid = uuidv4();
      const updatedContent = this.updateFrontmatter(fileContent, frontmatter);
      await this.app.vault.modify(file, updatedContent);
    }
    return frontmatter.uid;
  }

  private addMoreOptionsMenu(menu: Menu, file: TFile) {
    menu.addItem((item: MenuItem) => {
      item.setTitle('Copy Custom URL Link (Note Name)')
        .setIcon('link')
        .onClick(async () => {
          await this.generateLinkForCurrentNoteWithUID(file, 'name');
        });
    });

    menu.addItem((item: MenuItem) => {
      item.setTitle('Copy Custom URL Link (Link)')
        .setIcon('link')
        .onClick(async () => {
          await this.generateLinkForCurrentNoteWithUID(file, 'link');
        });
    });
  }

  private async generateLinkForCurrentNoteWithUID(file: TFile, linkFormat: string) {
    console.log('Attempting to generate link for current note with UID');
    const vaultName = this.app.vault.getName();
    const filePath = file.path;
    const noteUID = await this.ensureNoteUID(file);
    const fileName = file.name;

    let notionUrl = '';
    if (this.settings.useNoteUID) {
      notionUrl = `${this.settings.redirectDomain}/?path=obsidian-open&vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(noteUID)}&newpane=true`;
    } else {
      notionUrl = `${this.settings.redirectDomain}/?path=obsidian-open&vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(filePath)}&newpane=true`;
    }

    if (linkFormat === 'name') {
      new Notice(`Generated Link: [${fileName}](${notionUrl})`);
      console.log(`Generated Link: [${fileName}](${notionUrl})`);
      await navigator.clipboard.writeText(`[${fileName}](${notionUrl})`);
    } else {
      new Notice(`Generated Link: ${notionUrl}`);
      console.log(`Generated Link: ${notionUrl}`);
      await navigator.clipboard.writeText(notionUrl);
    }
    new Notice('Link copied to clipboard');
  }
}

class CustomUriRedirectSettingTab extends PluginSettingTab {
  plugin: CustomUriRedirectPlugin;

  constructor(app: App, plugin: CustomUriRedirectPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    console.log('Displaying settings for Custom URI Redirect Plugin');
    containerEl.createEl('h2', { text: 'Settings for Custom URI Redirect Plugin' });

    new Setting(containerEl)
      .setName('Redirect Domain')
      .setDesc('The base domain used for generating redirected links.')
      .addText((text) =>
        text
          .setPlaceholder('https://example.com')
          .setValue(this.plugin.settings.redirectDomain)
          .onChange(async (value) => {
            console.log(`User changed Redirect Domain to: ${value}`);
            if (!value.startsWith('https://')) {
              new Notice('Invalid domain format. Please enter a valid URL starting with https://');
              console.log('Invalid domain format entered');
              return;
            }
            this.plugin.settings.redirectDomain = value;
            await this.plugin.saveSettings();
            console.log('Redirect Domain changed to: ', value);
          })
      );

    new Setting(containerEl)
      .setName('Use Vault Name')
      .setDesc('Include the vault name in the generated link.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.useVaultName)
          .onChange(async (value) => {
            this.plugin.settings.useVaultName = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Use Vault ID')
      .setDesc('Include the vault ID in the generated link.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.useVaultID)
          .onChange(async (value) => {
            this.plugin.settings.useVaultID = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Use Note Name')
      .setDesc('Include the note name in the generated link.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.useNoteName)
          .onChange(async (value) => {
            this.plugin.settings.useNoteName = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Use Note UID')
      .setDesc('Include the note UID in the generated link.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.useNoteUID)
          .onChange(async (value) => {
            this.plugin.settings.useNoteUID = value;
            await this.plugin.saveSettings();
          })
      );
  }
}

class LinkGeneratorModal extends Modal {
  plugin: CustomUriRedirectPlugin;

  constructor(app: App, plugin: CustomUriRedirectPlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: 'Generate Custom URI Link' });

    const linkFormatDropdown = new DropdownComponent(contentEl);
    linkFormatDropdown.addOption('name', 'Note Name');
    linkFormatDropdown.addOption('link', 'Link');
    linkFormatDropdown.setValue('name');

    const generateButton = new ButtonComponent(contentEl)
      .setButtonText('Generate Link')
      .onClick(async () => {
        const linkFormat = linkFormatDropdown.getValue();
        await this.plugin.generateLinkForCurrentNote(linkFormat);
        this.close();
      });

    const closeButton = new ButtonComponent(contentEl)
      .setButtonText('Close')
      .onClick(() => {
        this.close();
      });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}