import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import * as moment from 'moment';
import { Article } from '../models/types/article';
import { Member } from '../models/types/member';

interface TextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
  link?: string;
}

interface ContentBlock {
  type: 'paragraph' | 'h1' | 'h2' | 'h3' | 'list-item' | 'ordered-list-item' | 'blockquote' | 'hr' | 'br';
  segments: TextSegment[];
  indent: number;
  listIndex?: number;
  blockquoteDepth?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ArticlePdfService {
  private readonly PAGE_WIDTH = 210;
  private readonly PAGE_HEIGHT = 297;
  private readonly MARGIN = 25;
  private readonly CONTENT_WIDTH = this.PAGE_WIDTH - (this.MARGIN * 2);
  private readonly HEADER_HEIGHT = 18;
  private readonly FOOTER_HEIGHT = 12;

  private readonly FONT_SIZE_H1 = 18;
  private readonly FONT_SIZE_H2 = 15;
  private readonly FONT_SIZE_H3 = 13;
  private readonly FONT_SIZE_P = 11;
  private readonly LINE_HEIGHT = 1.5;

  private pdf!: jsPDF;
  private currentY = 0;
  private logoImage: string | null = null;

  async generatePdf(article: Article, author: Member): Promise<void> {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    this.currentY = this.HEADER_HEIGHT + 8;

    await this.loadLogo();
    this.addHeader();
    this.addTitleSection(article, author);

    const blocks = this.parseMarkdown(article.content);
    this.renderBlocks(blocks);

    this.addFooterToAllPages();

    const fileName = this.sanitizeFileName(article.title);
    this.pdf.save(`${fileName}.pdf`);
  }

  private async loadLogo(): Promise<void> {
    try {
      const response = await fetch('/assets/agora-logo-black.png');
      const blob = await response.blob();
      this.logoImage = await this.blobToBase64(blob);
    } catch (error) {
      console.warn('Could not load logo image:', error);
      this.logoImage = null;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private addHeader(): void {
    this.pdf.setFillColor(250, 250, 248);
    this.pdf.rect(0, 0, this.PAGE_WIDTH, this.HEADER_HEIGHT, 'F');

    this.pdf.setDrawColor(230, 230, 228);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(0, this.HEADER_HEIGHT, this.PAGE_WIDTH, this.HEADER_HEIGHT);

    if (this.logoImage) {
      try {
        const logoHeight = 7;
        const logoWidth = logoHeight * (167 / 62);
        this.pdf.addImage(this.logoImage, 'PNG', this.MARGIN, 5.5, logoWidth, logoHeight);
      } catch {
        this.addTextLogo();
      }
    } else {
      this.addTextLogo();
    }
  }

  private addTextLogo(): void {
    this.pdf.setTextColor(144, 110, 46);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.text('AGORA', this.MARGIN, 12);
  }

  private addTitleSection(article: Article, author: Member): void {
    this.currentY = this.HEADER_HEIGHT + 12;

    this.pdf.setTextColor(30, 30, 30);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(22);

    const titleLines = this.pdf.splitTextToSize(article.title, this.CONTENT_WIDTH);
    const titleLineHeight = 22 * 0.45;

    this.checkPageBreak(titleLines.length * titleLineHeight + 20);

    for (const line of titleLines) {
      this.pdf.text(line, this.MARGIN, this.currentY);
      this.currentY += titleLineHeight;
    }

    this.currentY += 6;

    this.pdf.setTextColor(100, 100, 100);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);

    const dateText = moment(article.createdAt).locale('pt-br').format('DD [de] MMMM [de] YYYY');
    const metaText = `Por ${author.name}  •  ${dateText}`;
    this.pdf.text(metaText, this.MARGIN, this.currentY);
    this.currentY += 10;

    this.pdf.setDrawColor(220, 220, 218);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(this.MARGIN, this.currentY, this.PAGE_WIDTH - this.MARGIN, this.currentY);
    this.currentY += 10;
  }

  private parseMarkdown(content: string): ContentBlock[] {
    // Pre-process: normalize line endings and handle <br> tags
    let processed = content
      .replace(/\r\n/g, '\n')
      .replace(/<br\s*\/?>/gi, '\n{{BR}}\n');

    // Handle HTML links: <a href="url">text</a>
    processed = processed.replace(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, '[$2]($1)');

    // Handle auto-links: <https://...> and <email@...>
    processed = processed.replace(/<(https?:\/\/[^>]+)>/g, '[$1]($1)');
    processed = processed.replace(/<([^@>]+@[^>]+)>/g, '[$1](mailto:$1)');

    const lines = processed.split('\n');
    const blocks: ContentBlock[] = [];

    let i = 0;
    let safetyCounter = 0;
    const maxIterations = lines.length * 2 + 1000; // Safety limit

    while (i < lines.length) {
      safetyCounter++;
      if (safetyCounter > maxIterations) {
        console.error('parseMarkdown: Safety limit reached, breaking loop');
        break;
      }
      const line = lines[i];
      const trimmed = line.trim();

      // Empty line
      if (trimmed === '') {
        i++;
        continue;
      }

      // BR marker
      if (trimmed === '{{BR}}') {
        blocks.push({ type: 'br', segments: [], indent: 0 });
        i++;
        continue;
      }

      // Horizontal rule
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        blocks.push({ type: 'hr', segments: [], indent: 0 });
        i++;
        continue;
      }

      // Headers
      const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const type = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
        blocks.push({
          type,
          segments: this.parseInlineFormatting(text),
          indent: 0
        });
        i++;
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('>')) {
        const blockquoteLines: string[] = [];
        let bqDepth = 1;
        let bqSafety = 0;

        // Collect all consecutive blockquote lines
        while (i < lines.length && bqSafety < lines.length + 10) {
          bqSafety++;
          const bqLine = lines[i].trim();
          if (bqLine.startsWith('>') || (bqLine === '' && i + 1 < lines.length && lines[i + 1].trim().startsWith('>'))) {
            blockquoteLines.push(bqLine);
            // Track max depth
            const match = bqLine.match(/^>+/);
            if (match) {
              bqDepth = Math.max(bqDepth, match[0].length);
            }
            i++;
          } else {
            break;
          }
        }

        // Process blockquote content
        const bqContent = blockquoteLines
          .map(l => l.replace(/^>+\s*/, ''))
          .join('\n');

        // Parse content inside blockquote (can have headers, formatting, etc.)
        const innerBlocks = this.parseBlockquoteContent(bqContent, bqDepth);
        blocks.push(...innerBlocks);
        continue;
      }

      // Ordered list
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (orderedMatch) {
        const indent = this.getIndentLevel(line);
        const result = this.parseListItem(lines, i, 'ordered', indent);
        blocks.push(...result.blocks);
        i = result.nextIndex;
        continue;
      }

      // Unordered list
      const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
      if (unorderedMatch) {
        const indent = this.getIndentLevel(line);
        const result = this.parseListItem(lines, i, 'unordered', indent);
        blocks.push(...result.blocks);
        i = result.nextIndex;
        continue;
      }

      // Regular paragraph - collect until empty line or special element
      const paragraphLines: string[] = [trimmed];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i].trim();
        if (nextLine === '' ||
            nextLine === '{{BR}}' ||
            nextLine.startsWith('#') ||
            nextLine.startsWith('>') ||
            nextLine.match(/^[-*]\s/) ||
            nextLine.match(/^\d+\.\s/) ||
            /^(-{3,}|\*{3,}|_{3,})$/.test(nextLine)) {
          break;
        }
        paragraphLines.push(nextLine);
        i++;
      }

      const paragraphText = paragraphLines.join(' ');
      blocks.push({
        type: 'paragraph',
        segments: this.parseInlineFormatting(paragraphText),
        indent: 0
      });
    }

    return blocks;
  }

  private parseBlockquoteContent(content: string, depth: number): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    const lines = content.split('\n');
    let currentText: string[] = [];

    const flushText = () => {
      if (currentText.length > 0) {
        const text = currentText.join(' ').trim();
        if (text) {
          blocks.push({
            type: 'blockquote',
            segments: this.parseInlineFormatting(text),
            indent: 0,
            blockquoteDepth: depth
          });
        }
        currentText = [];
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === '' || trimmed === '{{BR}}') {
        flushText();
        if (trimmed === '{{BR}}') {
          blocks.push({ type: 'br', segments: [], indent: 0, blockquoteDepth: depth });
        }
        continue;
      }

      // Check for header inside blockquote
      const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (headerMatch) {
        flushText();
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        blocks.push({
          type: 'blockquote',
          segments: this.parseInlineFormatting(text),
          indent: 0,
          blockquoteDepth: depth
        });
        continue;
      }

      currentText.push(trimmed);
    }

    flushText();
    return blocks;
  }

  private parseListItem(
    lines: string[],
    startIndex: number,
    type: 'ordered' | 'unordered',
    baseIndent: number,
    depth: number = 0
  ): { blocks: ContentBlock[]; nextIndex: number } {
    const blocks: ContentBlock[] = [];
    let i = startIndex;
    let listCounter = 1;
    let safetyCounter = 0;
    const maxIterations = lines.length + 100;

    // Prevent excessive recursion
    if (depth > 10) {
      console.error('parseListItem: Max recursion depth reached');
      return { blocks, nextIndex: i + 1 };
    }

    while (i < lines.length) {
      safetyCounter++;
      if (safetyCounter > maxIterations) {
        console.error('parseListItem: Safety limit reached, breaking loop');
        break;
      }
      const line = lines[i];
      const trimmed = line.trim();
      const currentIndent = this.getIndentLevel(line);

      // Empty line might end the list or be part of multi-line item
      if (trimmed === '') {
        // Look ahead to see if list continues
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const nextTrimmed = nextLine.trim();
          const nextIndent = this.getIndentLevel(nextLine);

          // If next line is indented content or a list item at same/higher level, continue
          if (nextIndent > baseIndent ||
              (nextIndent === baseIndent && (nextTrimmed.match(/^[-*]\s/) || nextTrimmed.match(/^\d+\.\s/)))) {
            i++;
            continue;
          }
        }
        break;
      }

      // Check if this is a list item at the current indent level
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);

      if (currentIndent === baseIndent && (orderedMatch || unorderedMatch)) {
        const itemText = orderedMatch ? orderedMatch[2] : unorderedMatch![1];

        blocks.push({
          type: type === 'ordered' ? 'ordered-list-item' : 'list-item',
          segments: this.parseInlineFormatting(itemText),
          indent: baseIndent,
          listIndex: type === 'ordered' ? listCounter++ : undefined
        });
        i++;
        continue;
      }

      // Check for sub-list (increased indent)
      if (currentIndent > baseIndent && (orderedMatch || unorderedMatch)) {
        const subType = orderedMatch ? 'ordered' : 'unordered';
        const result = this.parseListItem(lines, i, subType, currentIndent, depth + 1);
        blocks.push(...result.blocks);
        i = result.nextIndex;
        continue;
      }

      // Indented content (continuation of previous list item)
      if (currentIndent > baseIndent && !orderedMatch && !unorderedMatch) {
        // This is continuation content - add as indented paragraph
        if (trimmed === '{{BR}}') {
          blocks.push({ type: 'br', segments: [], indent: baseIndent + 1 });
          i++;
          continue;
        }

        // Check for blockquote inside list
        if (trimmed.startsWith('>')) {
          const bqText = trimmed.replace(/^>\s*/, '');
          blocks.push({
            type: 'blockquote',
            segments: this.parseInlineFormatting(bqText),
            indent: baseIndent + 1,
            blockquoteDepth: 1
          });
          i++;
          continue;
        }

        blocks.push({
          type: 'paragraph',
          segments: this.parseInlineFormatting(trimmed),
          indent: baseIndent + 1
        });
        i++;
        continue;
      }

      // Different indent level or not a list item - end this list
      break;
    }

    return { blocks, nextIndex: i };
  }

  private getIndentLevel(line: string): number {
    const match = line.match(/^(\s*)/);
    if (!match) return 0;
    const spaces = match[1].length;
    // 4 spaces or 1 tab = 1 indent level
    return Math.floor(spaces / 4);
  }

  private parseInlineFormatting(text: string, depth: number = 0): TextSegment[] {
    const segments: TextSegment[] = [];

    // Prevent excessive recursion
    if (depth > 5) {
      return [{ text, bold: false, italic: false }];
    }

    // Process text character by character, tracking formatting state
    let current = '';
    let bold = false;
    let italic = false;
    let i = 0;
    let safetyCounter = 0;
    const maxIterations = text.length + 100;

    const flushCurrent = () => {
      if (current) {
        segments.push({ text: current, bold, italic });
        current = '';
      }
    };

    while (i < text.length) {
      safetyCounter++;
      if (safetyCounter > maxIterations) {
        console.error('parseInlineFormatting: Safety limit reached');
        flushCurrent();
        break;
      }
      // Check for links: [text](url) or [text](url "title")
      if (text[i] === '[') {
        const linkMatch = text.slice(i).match(/^\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          flushCurrent();
          const linkText = linkMatch[1];
          let url = linkMatch[2];
          // Remove title if present
          url = url.replace(/\s+"[^"]*"$/, '');
          segments.push({ text: linkText, bold, italic, link: url });
          i += linkMatch[0].length;
          continue;
        }
      }

      // Check for bold+italic: ***text*** or ___text___
      if ((text.slice(i, i + 3) === '***' || text.slice(i, i + 3) === '___')) {
        const marker = text.slice(i, i + 3);
        const endIndex = text.indexOf(marker, i + 3);
        if (endIndex !== -1) {
          flushCurrent();
          const innerText = text.slice(i + 3, endIndex);
          segments.push({ text: innerText, bold: true, italic: true });
          i = endIndex + 3;
          continue;
        }
      }

      // Check for bold: **text** or __text__
      if ((text.slice(i, i + 2) === '**' || text.slice(i, i + 2) === '__')) {
        const marker = text.slice(i, i + 2);
        const endIndex = text.indexOf(marker, i + 2);
        if (endIndex !== -1) {
          flushCurrent();
          const innerText = text.slice(i + 2, endIndex);
          // Check for link inside bold
          const innerSegments = this.parseInlineFormatting(innerText, depth + 1);
          for (const seg of innerSegments) {
            segments.push({ ...seg, bold: true });
          }
          i = endIndex + 2;
          continue;
        }
      }

      // Check for italic: *text* or _text_
      if ((text[i] === '*' || text[i] === '_') &&
          text[i - 1] !== text[i] && text[i + 1] !== text[i]) {
        const marker = text[i];
        const endIndex = text.indexOf(marker, i + 1);
        if (endIndex !== -1 && text[endIndex - 1] !== marker && text[endIndex + 1] !== marker) {
          flushCurrent();
          const innerText = text.slice(i + 1, endIndex);
          const innerSegments = this.parseInlineFormatting(innerText, depth + 1);
          for (const seg of innerSegments) {
            segments.push({ ...seg, italic: true });
          }
          i = endIndex + 1;
          continue;
        }
      }

      // Check for inline code: `text`
      if (text[i] === '`') {
        const endIndex = text.indexOf('`', i + 1);
        if (endIndex !== -1) {
          flushCurrent();
          segments.push({ text: text.slice(i + 1, endIndex), bold: false, italic: false });
          i = endIndex + 1;
          continue;
        }
      }

      current += text[i];
      i++;
    }

    flushCurrent();

    return segments.length > 0 ? segments : [{ text: '', bold: false, italic: false }];
  }

  private renderBlocks(blocks: ContentBlock[]): void {
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const nextBlock = blocks[i + 1];

      switch (block.type) {
        case 'h1':
          this.renderHeading(block, this.FONT_SIZE_H1, 8, 3);
          break;
        case 'h2':
          this.renderHeading(block, this.FONT_SIZE_H2, 6, 3);
          break;
        case 'h3':
          this.renderHeading(block, this.FONT_SIZE_H3, 5, 2);
          break;
        case 'paragraph':
          this.renderParagraph(block);
          break;
        case 'list-item':
        case 'ordered-list-item':
          this.renderListItem(block);
          break;
        case 'blockquote':
          this.renderBlockquote(block);
          break;
        case 'hr':
          this.renderHorizontalRule();
          break;
        case 'br':
          // BR adds a line break (smaller than paragraph spacing)
          this.currentY += this.FONT_SIZE_P * 0.4 * this.LINE_HEIGHT * 0.6;
          break;
      }
    }
  }

  private renderHeading(block: ContentBlock, fontSize: number, marginTop: number, marginBottom: number): void {
    this.currentY += marginTop;

    this.pdf.setTextColor(30, 30, 30);
    this.pdf.setFontSize(fontSize);

    const text = this.segmentsToPlainText(block.segments);
    const lines = this.pdf.splitTextToSize(text, this.CONTENT_WIDTH);
    const lineHeight = fontSize * 0.4 * this.LINE_HEIGHT;

    this.checkPageBreak(lines.length * lineHeight + marginBottom);

    this.pdf.setFont('helvetica', 'bold');
    for (const line of lines) {
      this.pdf.text(line, this.MARGIN, this.currentY);
      this.currentY += lineHeight;
    }

    this.currentY += marginBottom;
  }

  private renderParagraph(block: ContentBlock): void {
    const indentOffset = block.indent * 8;
    const textX = this.MARGIN + indentOffset;
    const textWidth = this.CONTENT_WIDTH - indentOffset;

    this.pdf.setTextColor(50, 50, 50);
    this.pdf.setFontSize(this.FONT_SIZE_P);

    const lineHeight = this.FONT_SIZE_P * 0.4 * this.LINE_HEIGHT;

    // Render segments with formatting
    this.renderFormattedText(block.segments, textX, textWidth, lineHeight);

    // Extra space between paragraphs (more than line spacing within paragraph)
    this.currentY += 6;
  }

  private renderListItem(block: ContentBlock): void {
    const baseIndent = 8;
    const indentOffset = block.indent * 8 + baseIndent;
    const bulletX = this.MARGIN + indentOffset - 4;
    const textX = this.MARGIN + indentOffset + 2;
    const textWidth = this.CONTENT_WIDTH - indentOffset - 2;

    this.pdf.setTextColor(50, 50, 50);
    this.pdf.setFontSize(this.FONT_SIZE_P);

    const lineHeight = this.FONT_SIZE_P * 0.4 * this.LINE_HEIGHT;

    this.checkPageBreak(lineHeight);

    // Draw bullet or number
    this.pdf.setFont('helvetica', 'normal');
    const bullet = block.type === 'ordered-list-item' ? `${block.listIndex}.` : '•';
    this.pdf.text(bullet, bulletX, this.currentY);

    // Render text with formatting
    this.renderFormattedText(block.segments, textX, textWidth, lineHeight);

    this.currentY += 2;
  }

  private renderBlockquote(block: ContentBlock): void {
    const indentOffset = block.indent * 8;
    const borderWidth = 2.5;
    const paddingH = 8;
    const paddingV = 6; // vertical padding above and below text
    const textX = this.MARGIN + indentOffset + borderWidth + paddingH;
    const textWidth = this.CONTENT_WIDTH - indentOffset - borderWidth - paddingH - 4;

    this.pdf.setFontSize(this.FONT_SIZE_P);

    // Check if blockquote contains links
    const hasLinks = block.segments.some(s => s.link);

    const text = this.segmentsToPlainText(block.segments);
    const lines = this.pdf.splitTextToSize(text, textWidth);
    const lineHeight = this.FONT_SIZE_P * 0.4 * this.LINE_HEIGHT;

    // Calculate block dimensions for proper vertical centering
    // Text baseline is where jsPDF draws - ascender goes ~3mm above, descender ~1mm below
    const ascender = 3;
    const textBlockHeight = lines.length * lineHeight;
    const blockHeight = paddingV + ascender + textBlockHeight + paddingV;

    this.checkPageBreak(blockHeight + 4);

    // Calculate box position: box top is paddingV + ascender above first baseline
    const boxTop = this.currentY - paddingV - ascender;

    // Draw background
    this.pdf.setFillColor(248, 248, 246);
    this.pdf.rect(this.MARGIN + indentOffset, boxTop, this.CONTENT_WIDTH - indentOffset, blockHeight, 'F');

    // Draw gold left border
    this.pdf.setFillColor(180, 140, 60);
    this.pdf.rect(this.MARGIN + indentOffset, boxTop, borderWidth, blockHeight, 'F');

    // Render text
    if (hasLinks) {
      // Use segment-based rendering for clickable links
      const italicSegments = block.segments.map(s => ({ ...s, italic: true }));
      this.renderFormattedText(italicSegments, textX, textWidth, lineHeight, true);
    } else {
      // Simple text rendering
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.setTextColor(70, 70, 70);
      for (const line of lines) {
        this.pdf.text(line, textX, this.currentY);
        this.currentY += lineHeight;
      }
    }

    // Set currentY to after the box, regardless of rendering method
    this.currentY = boxTop + blockHeight + 4;
  }

  private renderFormattedText(
    segments: TextSegment[],
    startX: number,
    maxWidth: number,
    lineHeight: number,
    isBlockquote: boolean = false
  ): void {
    const fullText = this.segmentsToPlainText(segments);
    if (!fullText.trim()) {
      return;
    }

    // Check if we have any special formatting
    const hasLinks = segments.some(s => s.link);
    const hasMixedFormatting = segments.some(s => s.bold) && segments.some(s => !s.bold) ||
                               segments.some(s => s.italic) && segments.some(s => !s.italic);

    // Simple case: no links and uniform formatting - use fast path
    if (!hasLinks && !hasMixedFormatting) {
      const lines = this.pdf.splitTextToSize(fullText, maxWidth);
      this.checkPageBreak(lineHeight * Math.min(lines.length, 2));

      const hasBold = segments.some(s => s.bold);
      const hasItalic = segments.some(s => s.italic);
      const fontStyle = hasBold && hasItalic ? 'bolditalic' :
                        hasBold ? 'bold' :
                        hasItalic ? 'italic' : 'normal';
      this.pdf.setFont('helvetica', fontStyle);
      this.pdf.setTextColor(isBlockquote ? 70 : 50, isBlockquote ? 70 : 50, isBlockquote ? 70 : 50);

      for (const line of lines) {
        this.checkPageBreak(lineHeight);
        this.pdf.text(line, startX, this.currentY);
        this.currentY += lineHeight;
      }
      return;
    }

    // Complex case: render segment by segment with inline wrapping
    let currentX = startX;
    this.checkPageBreak(lineHeight);

    for (const segment of segments) {
      if (!segment.text) continue;

      // Set formatting for this segment
      const fontStyle = segment.bold && segment.italic ? 'bolditalic' :
                        segment.bold ? 'bold' :
                        segment.italic ? 'italic' : 'normal';
      this.pdf.setFont('helvetica', fontStyle);

      // Set color: blue for links, gray for blockquotes, dark for normal
      if (segment.link) {
        this.pdf.setTextColor(50, 80, 180); // Blue for links
      } else if (isBlockquote) {
        this.pdf.setTextColor(70, 70, 70);
      } else {
        this.pdf.setTextColor(50, 50, 50);
      }

      // Split segment text into words for wrapping
      const words = segment.text.split(/(\s+)/);

      for (const word of words) {
        if (!word) continue;

        const wordWidth = this.pdf.getTextWidth(word);

        // Check if word fits on current line
        if (currentX + wordWidth > startX + maxWidth && currentX > startX) {
          // Move to next line
          this.currentY += lineHeight;
          this.checkPageBreak(lineHeight);
          currentX = startX;
        }

        // Render the word
        this.pdf.text(word, currentX, this.currentY);

        // Add underline and clickable link
        if (segment.link && word.trim()) {
          this.pdf.setDrawColor(50, 80, 180);
          this.pdf.setLineWidth(0.2);
          this.pdf.line(currentX, this.currentY + 0.5, currentX + wordWidth, this.currentY + 0.5);

          // Add clickable link region
          const linkHeight = lineHeight * 0.8;
          this.pdf.link(currentX, this.currentY - linkHeight + 1, wordWidth, linkHeight + 1, { url: segment.link });
        }

        currentX += wordWidth;
      }
    }

    // Move to next line after the paragraph
    this.currentY += lineHeight;
  }

  private segmentsToPlainText(segments: TextSegment[]): string {
    return segments.map(s => s.text).join('');
  }

  private renderHorizontalRule(): void {
    this.currentY += 5;
    this.checkPageBreak(3);

    this.pdf.setDrawColor(220, 220, 218);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(this.MARGIN, this.currentY, this.PAGE_WIDTH - this.MARGIN, this.currentY);

    this.currentY += 6;
  }

  private checkPageBreak(requiredHeight: number): void {
    const availableHeight = this.PAGE_HEIGHT - this.FOOTER_HEIGHT - 5 - this.currentY;

    if (requiredHeight > availableHeight) {
      this.pdf.addPage();
      this.addContinuationHeader();
      this.currentY = this.HEADER_HEIGHT + 8;
    }
  }

  private addContinuationHeader(): void {
    this.pdf.setFillColor(250, 250, 248);
    this.pdf.rect(0, 0, this.PAGE_WIDTH, this.HEADER_HEIGHT, 'F');

    this.pdf.setDrawColor(230, 230, 228);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(0, this.HEADER_HEIGHT, this.PAGE_WIDTH, this.HEADER_HEIGHT);

    if (this.logoImage) {
      try {
        const logoHeight = 7;
        const logoWidth = logoHeight * (167 / 62);
        this.pdf.addImage(this.logoImage, 'PNG', this.MARGIN, 5.5, logoWidth, logoHeight);
      } catch {
        this.addTextLogo();
      }
    } else {
      this.addTextLogo();
    }
  }

  private addFooterToAllPages(): void {
    const totalPages = this.pdf.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);

      this.pdf.setTextColor(150, 150, 150);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(9);

      const pageText = `${i}`;
      const textWidth = this.pdf.getTextWidth(pageText);
      this.pdf.text(pageText, (this.PAGE_WIDTH - textWidth) / 2, this.PAGE_HEIGHT - 8);
    }
  }

  private sanitizeFileName(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }
}
