import { App, Plugin, PluginSettingTab, Setting, Notice, Modal, ButtonComponent } from 'obsidian';

export default class CustomUriRedirectPlugin extends Plugin {
  async onload() {
    console.log('Loading Custom URI Redirect Plugin');
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
        this.generateLinkForCurrentNote();
      },
    });

    // Add a ribbon icon to the Obsidian UI
    const ribbonIconEl = this.addRibbonIcon('link', 'Generate Custom URI Link', (evt: MouseEvent) => {
      new LinkGeneratorModal(this.app, this).open();
    });
    ribbonIconEl.addClass('custom-uri-redirect-plugin-ribbon');
  }

  onunload() {
    console.log('Unloading Custom URI Redirect Plugin');
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
          const vault = params.get('vault');
          const file = params.get('file');

          if (vault && file) {
            notionUrl = `https://jax-baiya.github.io/obsidian-redirect/?path=obsidian-open&vault=${encodeURIComponent(vault)}&file=${encodeURIComponent(file)}`;
            console.log(`Generated Notion URL for obsidian://open: ${notionUrl}`);
          }
        } else if (href.startsWith('obsidian://adv-uri')) {
          const params = new URLSearchParams(href.replace('obsidian://adv-uri?', ''));
          const vault = params.get('vault');
          const uid = params.get('uid');
          const filepath = params.get('filepath');

          if (vault && uid && filepath) {
            notionUrl = `https://jax-baiya.github.io/obsidian-redirect/?path=obsidian-adv-uri&vault=${encodeURIComponent(vault)}&uid=${encodeURIComponent(uid)}&filepath=${encodeURIComponent(filepath)}`;
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

  public async generateLinkForCurrentNote() {  // Change to public
    console.log('Attempting to generate link for current note');
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      const vaultName = this.app.vault.getName();
      const filePath = activeFile.path;
      const notionUrl = `https://jax-baiya.github.io/obsidian-redirect/?path=obsidian-open&vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(filePath)}`;
      new Notice(`Generated Link: ${notionUrl}`);
      console.log(`Generated Link: ${notionUrl}`);
      await navigator.clipboard.writeText(notionUrl);
      new Notice('Link copied to clipboard');
    } else {
      new Notice('No active note found to generate the link.');
      console.log('No active note found to generate the link');
    }
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
          .setValue('https://jax-baiya.github.io/obsidian-redirect')
          .onChange(async (value) => {
            console.log(`User changed Redirect Domain to: ${value}`);
            if (!value.startsWith('https://')) {
              new Notice('Invalid domain format. Please enter a valid URL starting with https://');
              console.log('Invalid domain format entered');
              return;
            }
            console.log('Redirect Domain changed to: ', value);
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

    const generateButton = new ButtonComponent(contentEl)
      .setButtonText('Generate Link')
      .onClick(async () => {
        await this.plugin.generateLinkForCurrentNote();
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