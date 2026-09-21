/**
 * Interfaz preparada para OCR real (Google Vision, AWS Textract, etc.).
 * En v1 no se llama a APIs de pago: stub que no hace nada.
 */
export type OcrResult = {
  rawText?: string;
  vendor?: string;
  amount?: number;
  currency?: string;
  invoiceDate?: string;
  confidence?: number;
};

export interface OcrProvider {
  extract(input: {
    storageKey: string;
    mimeType: string;
  }): Promise<OcrResult | null>;
}

export class StubOcrProvider implements OcrProvider {
  async extract(): Promise<OcrResult | null> {
    return null;
  }
}

let provider: OcrProvider | null = null;

export function getOcrProvider(): OcrProvider {
  if (!provider) provider = new StubOcrProvider();
  return provider;
}
