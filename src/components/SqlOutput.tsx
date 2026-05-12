import React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SqlOutputProps {
  sql: string;
}

export function SqlOutput({ sql }: SqlOutputProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting
  const highlightSql = (text: string) => {
    const keywords = ['INSERT INTO', 'DELETE FROM', 'VALUES', 'SELECT', 'FROM', 'WHERE'];
    let highlighted = text;
    
    // Escape html
    highlighted = highlighted.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    // Highlight keywords
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-primary font-semibold">${kw}</span>`);
    });
    
    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="text-blue-400">$1</span>');
    
    // Highlight strings
    highlighted = highlighted.replace(/('[^']*')/g, '<span class="text-green-400">$1</span>');
    
    // Highlight comments
    highlighted = highlighted.replace(/(--.*)/g, '<span class="text-gray-500 italic">$1</span>');
    
    return highlighted;
  };

  return (
    <div className="relative rounded-md border border-border bg-black p-4 overflow-hidden">
      <div className="absolute right-2 top-2">
        <Button
          variant="secondary"
          size="sm"
          className="h-8 gap-1.5"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="text-xs">{copied ? "Copied" : "Copy SQL"}</span>
        </Button>
      </div>
      <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap pt-8 pb-4 break-all">
        <code dangerouslySetInnerHTML={{ __html: highlightSql(sql) }} />
      </pre>
    </div>
  );
}
