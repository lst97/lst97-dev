'use client'

/**
 * Interface for Magika prediction deep learning result
 */
export interface MagikaDLResult {
  label: string
  is_text: boolean
  description?: string
  mime_type?: string
  group?: string
  extensions?: string[]
}

/**
 * Interface for Magika prediction output
 */
export interface MagikaOutputResult {
  label: string
  is_text: boolean
  description?: string
  mime_type?: string
  group?: string
  extensions?: string[]
}

/**
 * Interface for Magika prediction scores map
 */
export interface MagikaScoresMap {
  [key: string]: number
}

/**
 * Interface for Magika prediction result
 */
export interface MagikaPrediction {
  dl: MagikaDLResult
  output: MagikaOutputResult
  score: number
  overwrite_reason: string
  scores_map: MagikaScoresMap
}

/**
 * Interface for the result from Magika identifyBytes function
 */
export interface MagikaIdentifyResult {
  prediction: MagikaPrediction
}

/**
 * Interface for our processed detection result
 */
export interface MagikaDetectionResult {
  label: string
  description?: string
  mime_type?: string
  group?: string
  is_text?: boolean
  extensions?: string[]
  score: number
  warningMessage?: string
  rawResult: MagikaPrediction
}

export const SupportedFileTypes = [
  '3gp',
  'ace',
  'ai',
  'aidl',
  'apk',
  'applebplist',
  'appleplist',
  'asm',
  'asp',
  'autohotkey',
  'autoit',
  'awk',
  'batch',
  'bazel',
  'bib',
  'bmp',
  'bzip',
  'c',
  'cab',
  'cat',
  'chm',
  'clojure',
  'cmake',
  'cobol',
  'coff',
  'coffeescript',
  'cpp',
  'crt',
  'crx',
  'cs',
  'csproj',
  'css',
  'csv',
  'dart',
  'deb',
  'dex',
  'dicom',
  'diff',
  'dm',
  'dmg',
  'doc',
  'dockerfile',
  'docx',
  'dsstore',
  'dwg',
  'dxf',
  'elf',
  'elixir',
  'emf',
  'eml',
  'epub',
  'erb',
  'erlang',
  'flac',
  'flv',
  'fortran',
  'gemfile',
  'gemspec',
  'gif',
  'gitattributes',
  'gitmodules',
  'go',
  'gradle',
  'groovy',
  'gzip',
  'h5',
  'handlebars',
  'haskell',
  'hcl',
  'hlp',
  'htaccess',
  'html',
  'icns',
  'ico',
  'ics',
  'ignorefile',
  'ini',
  'internetshortcut',
  'ipynb',
  'iso',
  'jar',
  'java',
  'javabytecode',
  'javascript',
  'jinja',
  'jp2',
  'jpeg',
  'json',
  'jsonl',
  'julia',
  'kotlin',
  'latex',
  'lha',
  'lisp',
  'lnk',
  'lua',
  'm3u',
  'm4',
  'macho',
  'makefile',
  'markdown',
  'matlab',
  'mht',
  'midi',
  'mkv',
  'mp3',
  'mp4',
  'mscompress',
  'msi',
  'mum',
  'npy',
  'npz',
  'nupkg',
  'objectivec',
  'ocaml',
  'odp',
  'ods',
  'odt',
  'ogg',
  'one',
  'onnx',
  'otf',
  'outlook',
  'parquet',
  'pascal',
  'pcap',
  'pdb',
  'pdf',
  'pebin',
  'pem',
  'perl',
  'php',
  'pickle',
  'png',
  'po',
  'postscript',
  'powershell',
  'ppt',
  'pptx',
  'prolog',
  'proteindb',
  'proto',
  'psd',
  'python',
  'pythonbytecode',
  'pytorch',
  'qt',
  'r',
  'randombytes',
  'randomtxt',
  'rar',
  'rdf',
  'rpm',
  'rst',
  'rtf',
  'ruby',
  'rust',
  'scala',
  'scss',
  'sevenzip',
  'sgml',
  'shell',
  'smali',
  'snap',
  'solidity',
  'sql',
  'sqlite',
  'squashfs',
  'srt',
  'stlbinary',
  'stltext',
  'sum',
  'svg',
  'swf',
  'swift',
  'tar',
  'tcl',
  'textproto',
  'tga',
  'thumbsdb',
  'tiff',
  'toml',
  'torrent',
  'tsv',
  'ttf',
  'twig',
  'txt',
  'typescript',
  'vba',
  'vcxproj',
  'verilog',
  'vhdl',
  'vtt',
  'vue',
  'wasm',
  'wav',
  'webm',
  'webp',
  'winregistry',
  'wmf',
  'woff',
  'woff2',
  'xar',
  'xls',
  'xlsb',
  'xlsx',
  'xml',
  'xpi',
  'xz',
  'yaml',
  'yara',
  'zig',
  'zip',
  'zlibstream',
] as const

// Create a Set from the array for efficient O(1) average time complexity lookups
const SupportedFileTypesSet = new Set(SupportedFileTypes)

/**
 * Checks if a given file type label is present in the list of supported types.
 * Uses a Set for efficient lookup.
 * @param typeLabel The file type label (e.g., 'pdf', 'txt').
 * @returns True if the type is supported, false otherwise.
 */
export function isMagikaSupportedType(typeLabel: string): boolean {
  return SupportedFileTypesSet.has(typeLabel as (typeof SupportedFileTypes)[number])
}

/**
 * MagikaEngine for file type detection using Google's Magika library
 */
export class MagikaEngine {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private magikaInstance: any = null
  private initialized = false
  private initializing = false

  /**
   * Initialize the Magika engine if not already done
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true
    if (this.initializing) {
      // Wait for initialization to complete if already in progress
      while (this.initializing) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      return this.initialized
    }

    this.initializing = true
    try {
      // DO NOT MODIFY THE IMPORT PATH, otherwise the build will fail
      const { Magika } = await import('node_modules/magika/dist/mjs/magika.js')

      this.magikaInstance = await Magika.create()
      this.initialized = true
      return true
    } catch (error) {
      console.error('Failed to initialize Magika:', error)
      return false
    } finally {
      this.initializing = false
    }
  }

  /**
   * Detect the file type using Magika
   * @param file The file to analyze
   */
  async detectFileType(file: File): Promise<MagikaDetectionResult | null> {
    try {
      if (!this.initialized) {
        const success = await this.initialize()
        if (!success) {
          throw new Error('Failed to initialize Magika engine')
        }
      }

      // Read file as ArrayBuffer
      const buffer = await file.arrayBuffer()
      const fileBytes = new Uint8Array(buffer)

      // Process with Magika
      const { prediction } = (await this.magikaInstance.identifyBytes(
        fileBytes,
      )) as MagikaIdentifyResult

      // Check if the file type is well-supported by Magika
      const warningMessage = this.checkDetectionConfidence(prediction)

      return {
        label: prediction.output.label,
        description:
          prediction.output.description || prediction.output.label || 'No description available',
        mime_type: prediction.output.mime_type || `application/${prediction.output.label}`,
        group: prediction.output.group || this.getGroupFromLabel(prediction.output.label),
        is_text: prediction.output.is_text || false,
        extensions: prediction.output.extensions || [prediction.output.label],
        score: prediction.score,
        warningMessage,
        rawResult: prediction,
      }
    } catch (error) {
      console.error(`Error detecting file type with Magika:`, error)
      return null
    }
  }

  /**
   * Check if the file type is confidently detected by Magika
   * @param prediction The Magika prediction result
   * @returns A warning message if detection confidence is low, undefined otherwise
   */
  private checkDetectionConfidence(prediction: MagikaPrediction): string | undefined {
    // If score is below 0.7, consider it low confidence
    if (prediction.score < 0.7) {
      return 'Low confidence detection. The file type might not be accurately detected.'
    }

    // If the detected file type is not well-supported in scores_map
    if (
      prediction.scores_map &&
      Object.keys(prediction.scores_map).length > 0 &&
      !prediction.scores_map[prediction.output.label]
    ) {
      return 'The detected file type may not be fully supported by Magika.'
    }

    return undefined
  }

  /**
   * Get a file group from its label/extension
   * @param label The file label or extension
   * @returns The file group (video, audio, image, etc.)
   */
  private getGroupFromLabel(label: string): string {
    // A mapping of known file type labels to their groups
    const fileTypeGroups: Record<string, string> = {
      // Video formats
      '3gp': 'video',
      flv: 'video',
      mkv: 'video',
      mov: 'video',
      mp4: 'video',
      webm: 'video',
      avi: 'video',
      // Audio formats
      aac: 'audio',
      flac: 'audio',
      mp3: 'audio',
      ogg: 'audio',
      wav: 'audio',
      midi: 'audio',
      // Image formats
      ai: 'image',
      bmp: 'image',
      gif: 'image',
      ico: 'image',
      icns: 'image',
      jpeg: 'image',
      jpg: 'image',
      jp2: 'image',
      png: 'image',
      psd: 'image',
      svg: 'image',
      tga: 'image',
      tiff: 'image',
      webp: 'image',
      wmf: 'image',
      // Document formats
      doc: 'document',
      docx: 'document',
      epub: 'document',
      odt: 'document',
      pdf: 'document',
      ppt: 'document',
      pptx: 'document',
      rtf: 'document',
      xls: 'document',
      xlsb: 'document',
      xlsx: 'document',
      // Text formats
      bib: 'text',
      csv: 'text',
      diff: 'text',
      eml: 'text',
      ini: 'text',
      latex: 'text',
      markdown: 'text',
      md: 'text',
      po: 'text',
      rst: 'text',
      srt: 'text',
      tsv: 'text',
      txt: 'text',
      vtt: 'text',
      yaml: 'text',
      yara: 'text',
      log: 'text',
      nfo: 'text',
      properties: 'text',
      // Code formats
      aidl: 'code',
      asm: 'code',
      asp: 'code',
      autohotkey: 'code',
      autoit: 'code',
      awk: 'code',
      bash: 'code',
      bat: 'code',
      bazel: 'code',
      c: 'code',
      cmake: 'code',
      cobol: 'code',
      coffeescript: 'code',
      cpp: 'code',
      cs: 'code',
      cshtml: 'code',
      csproj: 'code',
      css: 'code',
      dart: 'code',
      dockerfile: 'code',
      dm: 'code',
      elixir: 'code',
      erb: 'code',
      erlang: 'code',
      f: 'code',
      f77: 'code',
      f90: 'code',
      f95: 'code',
      for: 'code',
      fortran: 'code',
      go: 'code',
      gradle: 'code',
      groovy: 'code',
      handlebars: 'code',
      haskell: 'code',
      hcl: 'code',
      html: 'code',
      java: 'code',
      javascript: 'code',
      jinja: 'code',
      js: 'code',
      json: 'code',
      jsonl: 'code',
      jsx: 'code',
      julia: 'code',
      kt: 'code',
      kts: 'code',
      kotlin: 'code',
      less: 'code',
      lisp: 'code',
      lua: 'code',
      m: 'code',
      m4: 'code',
      mak: 'code',
      makefile: 'code',
      matlab: 'code',
      ml: 'code',
      mli: 'code',
      mo: 'code',
      mod: 'code',
      nix: 'code',
      objectivec: 'code',
      ocaml: 'code',
      pas: 'code',
      pascal: 'code',
      perl: 'code',
      php: 'code',
      pl: 'code',
      pm: 'code',
      powershell: 'code',
      ps1: 'code',
      prolog: 'code',
      proto: 'code',
      py: 'code',
      python: 'code',
      r: 'code',
      rake: 'code',
      rb: 'code',
      rs: 'code',
      ruby: 'code',
      rust: 'code',
      scala: 'code',
      scss: 'code',
      sh: 'code',
      shell: 'code',
      sol: 'code',
      solidity: 'code',
      sql: 'code',
      swift: 'code',
      tcl: 'code',
      textproto: 'code',
      ts: 'code',
      tsx: 'code',
      twig: 'code',
      typescript: 'code',
      v: 'code',
      vba: 'code',
      vbproj: 'code',
      vcxproj: 'code',
      verilog: 'code',
      vhdl: 'code',
      vue: 'code',
      xml: 'code',
      xsd: 'code',
      xsl: 'code',
      yml: 'code',
      zig: 'code',
      '.babelrc': 'code',
      '.bashrc': 'code',
      '.editorconfig': 'code',
      '.eslintrc': 'code',
      '.gitattributes': 'code',
      '.gitignore': 'code',
      '.gitmodules': 'code',
      '.jshintrc': 'code',
      '.prettierrc': 'code',
      '.tern-project': 'code',
      '.travis.yml': 'code',
      '.vimrc': 'code',
      '.vscodeignore': 'code',
      '.jshintignore': 'code',
      npmrc: 'code',
      'package.json': 'code',
      'tsconfig.json': 'code',
      'webpack.config.js': 'code',
      // Archive formats
      '7z': 'archive',
      ace: 'archive',
      ar: 'archive',
      bz2: 'archive',
      cab: 'archive',
      gz: 'archive',
      iso: 'archive',
      jar: 'archive',
      lha: 'archive',
      rar: 'archive',
      rpm: 'archive',
      sevenzip: 'archive',
      squashfs: 'archive',
      tar: 'archive',
      xar: 'archive',
      zip: 'archive',
      zlibstream: 'archive',
      xz: 'archive',
      // Executables
      apk: 'executable',
      crx: 'executable',
      deb: 'executable',
      dex: 'executable',
      dmg: 'executable',
      elf: 'executable',
      msi: 'executable',
      nupkg: 'executable',
      pebin: 'executable',
      snap: 'executable',
      xpi: 'executable',
      // Data/Database
      applebplist: 'data',
      appleplist: 'data',
      cat: 'data',
      chm: 'data',
      dsstore: 'data',
      dwg: 'data',
      dxf: 'data',
      h5: 'data',
      hlp: 'data',
      internetshortcut: 'data',
      ipynb: 'data',
      javabytecode: 'data',
      lnk: 'data',
      mht: 'data',
      mscompress: 'data',
      mum: 'data',
      npy: 'data',
      npz: 'data',
      one: 'data',
      onnx: 'data',
      outlook: 'data',
      parquet: 'data',
      pcap: 'data',
      pdb: 'data',
      pem: 'data',
      pickle: 'data',
      proteindb: 'data',
      pytorch: 'data',
      qt: 'data',
      randombytes: 'data',
      randomtxt: 'data',
      rdf: 'data',
      smali: 'data',
      sqlite: 'data',
      stlbinary: 'data',
      stltext: 'data',
      sum: 'data',
      swf: 'data',
      thumbsdb: 'data',
      toml: 'data',
      torrent: 'data',
      ttf: 'data',
      woff: 'data',
      woff2: 'data',
      winregistry: 'data',
    }

    // Return the group if the label is in our mapping, otherwise return 'unknown'
    return fileTypeGroups[label] || 'unknown'
  }
}

export default MagikaEngine
