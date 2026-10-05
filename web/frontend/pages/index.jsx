import React, { useState } from 'react';
import { Page, Layout, Card, FormLayout, TextField, Button, BlockStack, Text, Box } from '@shopify/polaris';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

export default function AIDescriberForm() {
  const fetch = useAuthenticatedFetch();
  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [tags, setTags] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = async () => {
    if (!generatedText) return;
    setIsExporting(true);
    try {
      const { exportProductDescriptionPdf } = await import('@/lib/pdf-export');
      exportProductDescriptionPdf({ title, vendor, tags, htmlContent: generatedText });
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerate = async () => {
    if (!title) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/products/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, vendor, tags }),
      });
      const result = await res.json();
      if (result.success) setGeneratedText(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page title="AI Product Describer">
      <Layout>
        <Layout.Section variant="oneHalf">
          <Card padding="500">
            <FormLayout>
              <TextField label="Product Title" value={title} onChange={setTitle} autoComplete="off" />
              <TextField label="Brand" value={vendor} onChange={setVendor} autoComplete="off" />
              <TextField label="Tags" value={tags} onChange={setTags} autoComplete="off" />
              <Button variant="primary" onClick={handleGenerate} loading={isLoading}>Generate Description</Button>
            </FormLayout>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneHalf">
          <Card padding="500">
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Generated Output</Text>
              {generatedText ? (
                <BlockStack gap="200">
                  <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                    <div dangerouslySetInnerHTML={{ __html: generatedText }} />
                  </Box>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button onClick={handleCopy}>
                      {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
                    </Button>
                    <Button onClick={handleExportPdf} loading={isExporting}>
                      Export as PDF
                    </Button>
                  </div>
                </BlockStack>
              ) : <Text as="p" tone="subdued">Fill in attributes to run a test generation block.</Text>}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
