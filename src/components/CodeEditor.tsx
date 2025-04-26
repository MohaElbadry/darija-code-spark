
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';

type EditorTab = 'html' | 'css' | 'javascript';

const CodeEditor: React.FC = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar' || language === 'darija';
  const [activeTab, setActiveTab] = useState<EditorTab>('javascript');
  
  return (
    <div className="mt-8">
      <h2 className={`text-xl font-semibold mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>
        {t('section.editor')}
      </h2>
      
      <div className="border rounded-lg overflow-hidden shadow">
        <div className="bg-gray-100 px-4 py-2 flex border-b">
          <Button
            variant={activeTab === 'html' ? 'secondary' : 'ghost'}
            className="rounded-md hover:bg-gray-200"
            onClick={() => setActiveTab('html')}
          >
            {t('editor.html')}
          </Button>
          <Button
            variant={activeTab === 'css' ? 'secondary' : 'ghost'}
            className="rounded-md hover:bg-gray-200"
            onClick={() => setActiveTab('css')}
          >
            {t('editor.css')}
          </Button>
          <Button
            variant={activeTab === 'javascript' ? 'secondary' : 'ghost'}
            className="rounded-md hover:bg-gray-200"
            onClick={() => setActiveTab('javascript')}
          >
            {t('editor.js')}
          </Button>
        </div>
        
        <div className="bg-gray-900 text-gray-100 p-4 h-48 font-mono text-sm overflow-auto">
          {activeTab === 'javascript' && (
            <pre className="text-left">
              <code>
                <span className="text-green-400">// Your code here function sayHello() { console.log("مرحبا بالعالم"); }</span>
                {"\n"}
                <span className="text-blue-400">function</span> <span className="text-yellow-400">sayHello</span>() {"{"}
                {"\n  "}<span className="text-blue-400">console</span>.<span className="text-yellow-400">log</span>(<span className="text-green-400">"مرحبا بالعالم"</span>);
                {"\n}"}
              </code>
            </pre>
          )}
          
          {activeTab === 'html' && (
            <pre className="text-left">
              <code>
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
              <code>
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
    </div>
  );
};

export default CodeEditor;
