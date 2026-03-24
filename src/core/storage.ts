/**
 * PepsDoc - Storage
 * Leitura e escrita dos arquivos JSON de documentação
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  PepsDocConfig,
  EndpointGroup,
  PepsDocData,
  VersionData,
} from './schema';

const DEFAULT_DIR = 'pepsdoc';
const CONFIG_FILE = 'pepsdoc.config.json';
const DATA_DIR = 'data';

export class Storage {
  private baseDir: string;

  constructor(projectRoot: string) {
    this.baseDir = path.join(projectRoot, DEFAULT_DIR);
  }

  /** Caminho da pasta pepsdoc/ */
  get dir(): string {
    return this.baseDir;
  }

  /** Inicializa a estrutura de pastas */
  init(config: PepsDocConfig): void {
    // Cria pepsdoc/
    fs.mkdirSync(this.baseDir, { recursive: true });

    // Cria pepsdoc/data/
    const dataDir = path.join(this.baseDir, DATA_DIR);
    fs.mkdirSync(dataDir, { recursive: true });

    // Cria pepsdoc/pepsdoc.config.json
    const configPath = path.join(this.baseDir, CONFIG_FILE);
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    }

    // Cria pastas de versão
    const versions = config.versions?.map((v) => v.name) ?? ['v1'];
    for (const version of versions) {
      fs.mkdirSync(path.join(dataDir, version), { recursive: true });
    }
  }

  /** Lê a config */
  readConfig(): PepsDocConfig {
    const configPath = path.join(this.baseDir, CONFIG_FILE);
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config not found: ${configPath}`);
    }
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw) as PepsDocConfig;
  }

  /** Salva a config */
  writeConfig(config: PepsDocConfig): void {
    const configPath = path.join(this.baseDir, CONFIG_FILE);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  /** Lê todos os grupos de uma versão */
  readGroups(version: string): EndpointGroup[] {
    const versionDir = path.join(this.baseDir, DATA_DIR, version);
    if (!fs.existsSync(versionDir)) return [];

    const files = fs.readdirSync(versionDir).filter((f) => f.endsWith('.json') && f !== 'meta.json');
    const groups: EndpointGroup[] = [];

    for (const file of files) {
      const raw = fs.readFileSync(path.join(versionDir, file), 'utf-8');
      groups.push(JSON.parse(raw) as EndpointGroup);
    }

    return groups.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }

  /** Salva um grupo de endpoints */
  writeGroup(version: string, slug: string, group: EndpointGroup): void {
    const versionDir = path.join(this.baseDir, DATA_DIR, version);
    fs.mkdirSync(versionDir, { recursive: true });

    const filePath = path.join(versionDir, `${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(group, null, 2), 'utf-8');
  }

  /** Lista as versões disponíveis */
  listVersions(): string[] {
    const dataDir = path.join(this.baseDir, DATA_DIR);
    if (!fs.existsSync(dataDir)) return [];

    return fs.readdirSync(dataDir).filter((f) => {
      return fs.statSync(path.join(dataDir, f)).isDirectory();
    });
  }

  /** Compila tudo num objeto só (pro frontend) */
  compile(): PepsDocData {
    const config = this.readConfig();
    const versionNames = this.listVersions();

    const versions: VersionData[] = versionNames.map((name) => {
      const vConfig = config.versions?.find((v) => v.name === name);
      return {
        name,
        badge: vConfig?.badge,
        badgeColor: vConfig?.badgeColor,
        groups: this.readGroups(name),
      };
    });

    return { config, versions };
  }

  /** Verifica se o pepsdoc já foi inicializado */
  isInitialized(): boolean {
    return fs.existsSync(path.join(this.baseDir, CONFIG_FILE));
  }
}
