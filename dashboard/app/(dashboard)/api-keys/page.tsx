'use client';

import { useState } from 'react';
import { Key, Copy, Trash2, Plus, Eye, EyeOff, Check } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  createdAt: string;
  lastUsed?: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'sk_live_a1b2c3d4e5f6g7h8i9j0',
      scopes: ['read:merchants', 'read:stats'],
      createdAt: '2024-01-10',
      lastUsed: '2024-01-14',
    },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read:merchants']);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const availableScopes = [
    { value: 'read:merchants', label: 'Leer comercios' },
    { value: 'read:stats', label: 'Leer estadísticas' },
    { value: 'read:scores', label: 'Leer scores' },
    { value: 'write:webhooks', label: 'Configurar webhooks' },
  ];

  const handleCreateKey = () => {
    if (!newKeyName) return;

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      scopes: selectedScopes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setApiKeys([...apiKeys, newKey]);
    setShowCreateModal(false);
    setNewKeyName('');
    setSelectedScopes(['read:merchants']);
  };

  const handleDeleteKey = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta API key? Esta acción no se puede deshacer.')) {
      setApiKeys(apiKeys.filter(k => k.id !== id));
    }
  };

  const toggleRevealKey = (id: string) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
    }
    setRevealedKeys(newRevealed);
  };

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskKey = (key: string) => {
    return key.slice(0, 12) + '•'.repeat(20);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las claves de acceso a la API
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva API Key</span>
        </button>
      </div>

      {/* Documentation Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              Documentación de la API
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Usa estas API keys para acceder programáticamente a los datos de Score de Barrio.
            </p>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <code className="text-sm text-gray-800">
                curl -H "Authorization: Bearer sk_live_..." https://api.scoredebarrio.com/v1/merchants
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Tus API Keys ({apiKeys.length})
          </h2>
        </div>

        {apiKeys.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay API keys
            </h3>
            <p className="text-gray-500 mb-4">
              Crea tu primera API key para empezar a usar la API
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Crear API Key
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {apiKey.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                        {revealedKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <button
                        onClick={() => toggleRevealKey(apiKey.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title={revealedKeys.has(apiKey.id) ? 'Ocultar' : 'Revelar'}
                      >
                        {revealedKeys.has(apiKey.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Copiar"
                      >
                        {copiedKey === apiKey.id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteKey(apiKey.id)}
                    className="p-2 text-red-400 hover:text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {apiKey.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded"
                    >
                      {scope}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Creada: {new Date(apiKey.createdAt).toLocaleDateString('es-PE')}</span>
                  {apiKey.lastUsed && (
                    <span>Último uso: {new Date(apiKey.lastUsed).toLocaleDateString('es-PE')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nueva API Key
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Production API"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Scopes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permisos
                </label>
                <div className="space-y-2">
                  {availableScopes.map((scope) => (
                    <label key={scope.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedScopes([...selectedScopes, scope.value]);
                          } else {
                            setSelectedScopes(selectedScopes.filter(s => s !== scope.value));
                          }
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{scope.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyName || selectedScopes.length === 0}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}