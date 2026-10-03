import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Download, History, Palette, Settings, Type, Wifi, Mail, Phone, Link2 } from 'lucide-react';

type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

interface QRCodeSettings {
  type: QRType;
  value: string;
  size: number;
  fgColor: string;
  bgColor: string;
  level: ErrorCorrectionLevel;
  marginSize: number;
}

interface RecentQR {
  id: string;
  settings: QRCodeSettings;
  timestamp: number;
}

const PRESETS = [
  { name: 'Standard', fgColor: '#000000', bgColor: '#FFFFFF', level: 'M' as const },
  { name: 'Blue Vibe', fgColor: '#1d4ed8', bgColor: '#eff6ff', level: 'Q' as const },
  { name: 'Red Accent', fgColor: '#b91c1c', bgColor: '#fef2f2', level: 'H' as const },
  { name: 'Dark Mode', fgColor: '#ffffff', bgColor: '#1f2937', level: 'M' as const },
];

export default function App() {
  const [settings, setSettings] = useState<QRCodeSettings>({
    type: 'url',
    value: 'https://gdg.community.dev',
    size: 256,
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'M',
    marginSize: 4,
  });

  const [inputData, setInputData] = useState({
    url: 'https://gdg.community.dev',
    text: '',
    emailTo: '',
    emailSubject: '',
    emailBody: '',
    phone: '',
    wifiSsid: '',
    wifiPassword: '',
    wifiEncryption: 'WPA',
    wifiHidden: false,
  });

  const [recentQRs, setRecentQRs] = useState<RecentQR[]>(() => {
    const saved = localStorage.getItem('recentQRs');
    return saved ? JSON.parse(saved) : [];
  });

  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('recentQRs', JSON.stringify(recentQRs));
  }, [recentQRs]);

  const updateValueFromInputs = () => {
    let newValue = '';
    switch (settings.type) {
      case 'url':
        newValue = inputData.url;
        break;
      case 'text':
        newValue = inputData.text;
        break;
      case 'email':
        newValue = `mailto:${inputData.emailTo}?subject=${encodeURIComponent(inputData.emailSubject)}&body=${encodeURIComponent(inputData.emailBody)}`;
        break;
      case 'phone':
        newValue = `tel:${inputData.phone}`;
        break;
      case 'wifi':
        newValue = `WIFI:T:${inputData.wifiEncryption};S:${inputData.wifiSsid};P:${inputData.wifiPassword};${inputData.wifiHidden ? 'H:true' : ''};`;
        break;
    }
    setSettings((s) => ({ ...s, value: newValue }));
  };

  useEffect(() => {
    updateValueFromInputs();
  }, [inputData, settings.type]);

  const saveRecent = () => {
    if (!settings.value) return;
    const newRecent: RecentQR = {
      id: Math.random().toString(36).substring(7),
      settings: { ...settings },
      timestamp: Date.now(),
    };
    setRecentQRs((prev) => [newRecent, ...prev].slice(0, 10)); // Keep last 10
  };

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${Date.now()}.png`;
      a.click();
      saveRecent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">QR Code Generator & Designer</h1>
          <p className="text-lg text-gray-600">Create, customize, and download QR codes instantly.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Type Selection */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Type className="w-5 h-5" /> Select Type
              </h2>
              <div className="flex flex-wrap gap-2">
                {(['url', 'text', 'email', 'phone', 'wifi'] as QRType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSettings({ ...settings, type })}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      settings.type === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </section>

            {/* Input Form */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Content</h2>
              <div className="space-y-4">
                {settings.type === 'url' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">URL</label>
                    <input
                      type="url"
                      className="w-full p-2 border rounded-lg"
                      value={inputData.url}
                      onChange={(e) => setInputData({ ...inputData, url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                )}
                
                {settings.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Plain Text</label>
                    <textarea
                      className="w-full p-2 border rounded-lg"
                      rows={4}
                      value={inputData.text}
                      onChange={(e) => setInputData({ ...inputData, text: e.target.value })}
                      placeholder="Enter your text here..."
                    />
                  </div>
                )}

                {settings.type === 'email' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email To</label>
                      <input
                        type="email"
                        className="w-full p-2 border rounded-lg"
                        value={inputData.emailTo}
                        onChange={(e) => setInputData({ ...inputData, emailTo: e.target.value })}
                        placeholder="hello@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        value={inputData.emailSubject}
                        onChange={(e) => setInputData({ ...inputData, emailSubject: e.target.value })}
                        placeholder="Email subject"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Body</label>
                      <textarea
                        className="w-full p-2 border rounded-lg"
                        rows={3}
                        value={inputData.emailBody}
                        onChange={(e) => setInputData({ ...inputData, emailBody: e.target.value })}
                        placeholder="Email body..."
                      />
                    </div>
                  </div>
                )}

                {settings.type === 'phone' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full p-2 border rounded-lg"
                      value={inputData.phone}
                      onChange={(e) => setInputData({ ...inputData, phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                )}

                {settings.type === 'wifi' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Network Name (SSID)</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        value={inputData.wifiSsid}
                        onChange={(e) => setInputData({ ...inputData, wifiSsid: e.target.value })}
                        placeholder="My WiFi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Password</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg"
                        value={inputData.wifiPassword}
                        onChange={(e) => setInputData({ ...inputData, wifiPassword: e.target.value })}
                        placeholder="Password"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Encryption</label>
                        <select
                          className="w-full p-2 border rounded-lg"
                          value={inputData.wifiEncryption}
                          onChange={(e) => setInputData({ ...inputData, wifiEncryption: e.target.value })}
                        >
                          <option value="WPA">WPA/WPA2</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">None</option>
                        </select>
                      </div>
                      <div className="flex items-end mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inputData.wifiHidden}
                            onChange={(e) => setInputData({ ...inputData, wifiHidden: e.target.checked })}
                          />
                          <span className="text-sm">Hidden Network</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Customization */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" /> Design & Customization
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Foreground Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.fgColor}
                      onChange={(e) => setSettings({ ...settings, fgColor: e.target.value })}
                      className="h-10 w-14 p-1 border rounded"
                    />
                    <input
                      type="text"
                      value={settings.fgColor}
                      onChange={(e) => setSettings({ ...settings, fgColor: e.target.value })}
                      className="flex-1 p-2 border rounded-lg uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.bgColor}
                      onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                      className="h-10 w-14 p-1 border rounded"
                    />
                    <input
                      type="text"
                      value={settings.bgColor}
                      onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                      className="flex-1 p-2 border rounded-lg uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Error Correction Level</label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={settings.level}
                    onChange={(e) => setSettings({ ...settings, level: e.target.value as ErrorCorrectionLevel })}
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Higher levels improve scan reliability when customized.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Padding/Margin: {settings.marginSize}</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={settings.marginSize}
                    onChange={(e) => setSettings({ ...settings, marginSize: parseInt(e.target.value) })}
                    className="w-full mt-2"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Presets</h3>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setSettings({
                        ...settings,
                        fgColor: preset.fgColor,
                        bgColor: preset.bgColor,
                        level: preset.level
                      })}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors border border-gray-200"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Preview & Download */}
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Preview</h2>
              
              <div className="flex justify-center mb-6 overflow-hidden bg-gray-50 rounded-xl p-4 border border-gray-100">
                {settings.value ? (
                  <div ref={qrRef} className="max-w-full">
                    <QRCodeCanvas
                      value={settings.value}
                      size={settings.size}
                      bgColor={settings.bgColor}
                      fgColor={settings.fgColor}
                      level={settings.level}
                      marginSize={settings.marginSize}
                      includeMargin={true}
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-gray-400 bg-gray-100 rounded-xl">
                    Enter details to preview
                  </div>
                )}
              </div>

              <button
                onClick={handleDownload}
                disabled={!settings.value}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" /> Download PNG
              </button>
            </section>

            {/* Recent QR Codes */}
            {recentQRs.length > 0 && (
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <History className="w-5 h-5" /> Recent
                </h2>
                <div className="space-y-3">
                  {recentQRs.map((qr) => (
                    <button
                      key={qr.id}
                      onClick={() => setSettings(qr.settings)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all flex items-center gap-3"
                    >
                      <div className="w-10 h-10 flex-shrink-0 bg-white border shadow-sm flex items-center justify-center">
                        <QRCodeSVG
                          value={qr.settings.value}
                          size={32}
                          bgColor={qr.settings.bgColor}
                          fgColor={qr.settings.fgColor}
                          level="L"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {qr.settings.type.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {new Date(qr.timestamp).toLocaleDateString()} - {qr.settings.value}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
