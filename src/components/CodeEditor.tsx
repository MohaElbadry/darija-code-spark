import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';

type EditorTab = 'html' | 'css' | 'javascript';

const CodeEditor: React.FC = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'arabic' || language === 'darija';
  const [activeTab, setActiveTab] = useState<EditorTab>('javascript');
  const [htmlCode, setHtmlCode] = useState('<h1>Hello World</h1>');
  const [cssCode, setCssCode] = useState('body { font-family: sans-serif; }');
  const [jsCode, setJsCode] = useState('console.log("مرحبا بالعالم");');
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    // Create a complete HTML document with the current code
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>${jsCode}</script>
        </body>
      </html>
    `;
    setPreviewHtml(fullHtml);
  }, [htmlCode, cssCode, jsCode]);

  const handleCodeChange = (code: string) => {
    switch (activeTab) {
      case 'html':
        setHtmlCode(code);
        break;
      case 'css':
        setCssCode(code);
        break;
      case 'javascript':
        setJsCode(code);
        break;
    }
  };

  return (
    <div className="mt-8">
      <h2 className={`text-2xl font-bold mb-4 ${isRtl ? 'text-right' : 'text-left'} text-gray-800 dark:text-gray-100`}>
        {t('section.editor')}
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex border-b border-gray-200 dark:border-gray-700">
            <Button
              variant={activeTab === 'html' ? 'secondary' : 'ghost'}
              className={`rounded-lg transition-all duration-200 ${
                activeTab === 'html' 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('html')}
            >
              {t('editor.html')}
            </Button>
            <Button
              variant={activeTab === 'css' ? 'secondary' : 'ghost'}
              className={`rounded-lg transition-all duration-200 ${
                activeTab === 'css' 
                  ? 'bg-purple-500 text-white hover:bg-purple-600' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('css')}
            >
              {t('editor.css')}
            </Button>
            <Button
              variant={activeTab === 'javascript' ? 'secondary' : 'ghost'}
              className={`rounded-lg transition-all duration-200 ${
                activeTab === 'javascript' 
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('javascript')}
            >
              {t('editor.js')}
            </Button>
          </div>
          
          <div className="bg-gray-900 text-gray-100 p-6 h-64 font-mono text-sm overflow-auto">
            {activeTab === 'javascript' && (
              <pre className="text-left">
                <code contentEditable suppressContentEditableWarning onBlur={(e) => handleCodeChange(e.currentTarget.textContent || '')}>
                  <span className="text-green-400">// Your code here</span>
                  {"\n"}
                  <span className="text-blue-400">function</span> <span className="text-yellow-400">sayHello</span>() {"{"}
                  {"\n  "}<span className="text-blue-400">console</span>.<span className="text-yellow-400">log</span>(<span className="text-green-400">"مرحبا بالعالم"</span>);
                  {"\n"}{"}"} 
                </code>
              </pre>
            )}
            
            {activeTab === 'html' && (
              <pre className="text-left">
                <code contentEditable suppressContentEditableWarning onBlur={(e) => handleCodeChange(e.currentTarget.textContent || '')}>
                  <span className="text-blue-400">&lt;!DOCTYPE html&gt;</span>
                  {"\n"}<span className="text-blue-400">&lt;html&gt;</span>
                  {"\n  "}<span className="text-blue-400">&lt;head&gt;</span>
                  {"\n    "}<span className="text-blue-400">&lt;title&gt;</span>My Page<span className="text-blue-400">&lt;/title&gt;</span>
                  {"\n  "}<span className="text-blue-400">&lt;/head&gt;</span>
                  {"\n  "}<span className="text-blue-400">&lt;body&gt;</span>
                  {"\n    "}<span className="text-blue-400">&lt;h1&gt;</span>Hello World<span className="text-blue-400">&lt;/h1&gt;</span>
                  {"\n  "}<span className="text-blue-400">&lt;/body&gt;</span>
                  {"\n"}<span className="text-blue-400">&lt;/html&gt;</span>
                </code>
              </pre>
            )}
            
            {activeTab === 'css' && (
              <pre className="text-left">
                <code contentEditable suppressContentEditableWarning onBlur={(e) => handleCodeChange(e.currentTarget.textContent || '')}>
                  <span className="text-yellow-400">body</span> {"{"}
                  {"\n  "}<span className="text-blue-400">font-family</span>: <span className="text-green-400">sans-serif</span>;
                  {"\n  "}<span className="text-blue-400">margin</span>: <span className="text-purple-400">0</span>;
                  {"\n  "}<span className="text-blue-400">padding</span>: <span className="text-purple-400">0</span>;
                  {"\n"}{"}"} 
                  {"\n"}
                  {"\n"}<span className="text-yellow-400">h1</span> {"{"}
                  {"\n  "}<span className="text-blue-400">color</span>: <span className="text-green-400">#e32845</span>;
                  {"\n  "}<span className="text-blue-400">text-align</span>: <span className="text-green-400">center</span>;
                  {"\n"}{"}"} 
                </code>
              </pre>
            )}
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Live Preview</h3>
          </div>
          <div className="bg-white p-4 h-64 overflow-auto">
            <iframe
              srcDoc={previewHtml}
              title="Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
