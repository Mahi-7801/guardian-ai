import React, { useState } from 'react';
import { Shield, Brain, Network, Eye, Database, Users, AlertTriangle, Lock, TrendingUp, FileText } from 'lucide-react';

const AISecurityDiagrams = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const OverviewDiagram = () => (
    <div className="w-full h-full p-6 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-indigo-900">AI Security Framework Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
          <div className="flex items-center mb-4">
            <Database className="w-8 h-8 text-blue-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">Data Sources</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-blue-50 rounded">OSINT (Social Media)</div>
            <div className="p-2 bg-blue-50 rounded">SIGINT (Communications)</div>
            <div className="p-2 bg-blue-50 rounded">HUMINT (Human Sources)</div>
            <div className="p-2 bg-blue-50 rounded">IMINT (Imagery)</div>
            <div className="p-2 bg-blue-50 rounded">Sensor Networks</div>
            <div className="p-2 bg-blue-50 rounded">Crowdsourced Data</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
          <div className="flex items-center mb-4">
            <Brain className="w-8 h-8 text-purple-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">AI Processing</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-purple-50 rounded font-semibold">Machine Learning</div>
            <div className="pl-4 text-xs space-y-1">
              <div>• SVM, Random Forest</div>
              <div>• XGBoost, KNN</div>
            </div>
            <div className="p-2 bg-purple-50 rounded font-semibold">Deep Learning</div>
            <div className="pl-4 text-xs space-y-1">
              <div>• LSTM, CNN</div>
              <div>• Autoencoders</div>
            </div>
            <div className="p-2 bg-purple-50 rounded font-semibold">NLP</div>
            <div className="pl-4 text-xs space-y-1">
              <div>• BERT, GPT</div>
              <div>• Sentiment Analysis</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-green-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">Security Actions</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-green-50 rounded">Threat Detection</div>
            <div className="p-2 bg-green-50 rounded">Risk Prediction</div>
            <div className="p-2 bg-green-50 rounded">Network Disruption</div>
            <div className="p-2 bg-green-50 rounded">Alert Generation</div>
            <div className="p-2 bg-green-50 rounded">Intrusion Prevention</div>
            <div className="p-2 bg-green-50 rounded">Decision Support</div>
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-6xl mx-auto">
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
            <h4 className="font-bold text-yellow-900">Cross-Cutting Concerns</h4>
          </div>
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="bg-white p-2 rounded text-center">XAI (Explainability)</div>
            <div className="bg-white p-2 rounded text-center">Privacy Protection</div>
            <div className="bg-white p-2 rounded text-center">Human Oversight</div>
            <div className="bg-white p-2 rounded text-center">Bias Mitigation</div>
          </div>
        </div>
      </div>
    </div>
  );

  const MethodologyDiagram = () => (
    <div className="w-full h-full p-6 bg-gradient-to-br from-purple-50 to-pink-50 overflow-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-purple-900">AI Methods and Logic Flow</h2>
      
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            1. Predictive Analytics Pipeline
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-semibold text-sm">Historical Data</div>
              <div className="text-xs text-gray-600">Attack patterns 1970-2025</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="font-semibold text-sm">Feature Engineering</div>
              <div className="text-xs text-gray-600">Location, time, target type</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-semibold text-sm">Model Training</div>
              <div className="text-xs text-gray-600">XGBoost + PSO optimization</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <div className="font-semibold text-sm">Prediction</div>
              <div className="text-xs text-gray-600">96.6% accuracy</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            2. NLP Extremism Detection Pipeline
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-purple-100 p-3 rounded">
              <div className="font-semibold text-sm">Text Input</div>
              <div className="text-xs">Social media posts</div>
            </div>
            <div className="bg-purple-100 p-3 rounded">
              <div className="font-semibold text-sm">Preprocessing</div>
              <div className="text-xs">Tokenization, cleaning</div>
            </div>
            <div className="bg-purple-100 p-3 rounded">
              <div className="font-semibold text-sm">BERT Encoding</div>
              <div className="text-xs">Contextual embeddings</div>
            </div>
            <div className="bg-purple-100 p-3 rounded">
              <div className="font-semibold text-sm">Classification</div>
              <div className="text-xs">Extremist/Normal</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-purple-50 rounded">
            <div className="font-semibold text-sm mb-2">Logic:</div>
            <div className="text-xs text-gray-700">
              • Bidirectional context understanding<br/>
              • Attention mechanism highlights key phrases<br/>
              • Fine-tuned on extremist content datasets
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
          <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
            <Network className="w-6 h-6 mr-2" />
            3. Social Network Disruption Logic
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded">
              <div className="font-bold text-sm mb-2">Step 1: Mapping</div>
              <div className="text-xs mb-2">Graph Neural Networks extract relationships</div>
              <div className="w-full h-24 bg-white rounded flex items-center justify-center">
                <Network className="w-16 h-16 text-green-300" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="font-bold text-sm mb-2">Step 2: Analysis</div>
              <div className="text-xs mb-2">Calculate betweenness centrality</div>
              <div className="text-xs space-y-1 bg-white p-2 rounded">
                <div>Node A: 0.85 ⭐</div>
                <div>Node B: 0.72</div>
                <div>Node C: 0.43</div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="font-bold text-sm mb-2">Step 3: Disruption</div>
              <div className="text-xs mb-2">Target high-centrality nodes</div>
              <div className="text-xs bg-red-100 p-2 rounded">
                Remove Node A → Network fragments into isolated clusters
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-600">
          <h3 className="text-lg font-bold text-yellow-900 mb-4 flex items-center">
            <Eye className="w-6 h-6 mr-2" />
            4. Explainable AI (XAI) Layer
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded">
              <div className="font-bold text-sm mb-3">SHAP Method</div>
              <div className="text-xs mb-2">Feature Importance:</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center">
                  <div className="w-32">Keyword attack</div>
                  <div className="flex-1 bg-red-200 h-4 ml-2 rounded"></div>
                  <span className="ml-2">0.8</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32">Post frequency</div>
                  <div className="flex-1 bg-orange-200 h-4 ml-2 rounded" style={{width: '75%'}}></div>
                  <span className="ml-2">0.6</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32">Network size</div>
                  <div className="flex-1 bg-yellow-200 h-4 ml-2 rounded" style={{width: '50%'}}></div>
                  <span className="ml-2">0.4</span>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <div className="font-bold text-sm mb-3">Human Interpretation</div>
              <div className="text-xs bg-white p-3 rounded">
                <div className="font-semibold mb-1">Analyst Review:</div>
                <div>High-risk classification driven primarily by violent language patterns. Network connections suggest coordination. Recommend further investigation.</div>
              </div>
              <div className="mt-2 text-xs bg-green-100 p-2 rounded text-center font-semibold">
                ✓ Decision Validated
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DecisionFlowDiagram = () => (
    <div className="w-full h-full p-6 bg-gradient-to-br from-green-50 to-teal-50 overflow-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-green-900">Decision Logic and Method Selection</h2>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="space-y-6">
            <div className="border-4 border-blue-500 rounded-lg p-4 bg-blue-50">
              <div className="text-center font-bold text-lg mb-4">THREAT SCENARIO</div>
              <div className="text-center text-sm">What type of security challenge?</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-3">
                <div className="bg-purple-100 border-2 border-purple-500 rounded p-3 text-center">
                  <div className="font-bold text-sm">Text-Based Threats</div>
                  <div className="text-xs mt-1">Extremist content, phishing</div>
                </div>
                <div className="text-center text-2xl">↓</div>
                <div className="bg-purple-200 rounded p-3 text-xs">
                  <div className="font-bold mb-1">Method: NLP Pipeline</div>
                  <div>• BERT for context</div>
                  <div>• Sentiment analysis</div>
                  <div>• Topic modeling</div>
                </div>
                <div className="text-center text-2xl">↓</div>
                <div className="bg-purple-300 rounded p-3 text-xs text-center font-bold">
                  Classification + Alert
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-green-100 border-2 border-green-500 rounded p-3 text-center">
                  <div className="font-bold text-sm">Network Threats</div>
                  <div className="text-xs mt-1">Intrusions, malware</div>
                </div>
                <div className="text-center text-2xl">↓</div>
                <div className="bg-green-200 rounded p-3 text-xs">
                  <div className="font-bold mb-1">Method: Deep Learning</div>
                  <div>• LSTM-Autoencoder</div>
                  <div>• Anomaly detection</div>
                  <div>• Real-time monitoring</div>
                </div>
                <div className="text-center text-2xl">↓</div>
                <div className="bg-green-300 rounded p-3 text-xs text-center font-bold">
                  Block + Log
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-orange-100 border-2 border-orange-500 rounded p-3 text-center">
                  <div className="font-bold text-sm">Organizational Threats</div>
                  <div className="text-xs mt-1">Terrorist networks</div>
                </div>
                <div className="text-center text-2xl">↓</div>
                <div className="bg-orange-200 rounded p-3 text-xs">
                  <div className="font-bold mb-1">Method: Graph Analysis</div>
                  <div>• GNN mapping</div>
                  <div>• Centrality metrics</div>
                  <div>• STGCN prediction</div>
                </div>
                <div className="text-center text-2xl">↓</div>
                <div className="bg-orange-300 rounded p-3 text-xs text-center font-bold">
                  Disrupt Network
                </div>
              </div>
            </div>

            <div className="mt-6 border-4 border-yellow-500 rounded-lg p-4 bg-yellow-50">
              <div className="text-center font-bold mb-3">Explainability Required?</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded p-3">
                  <div className="font-bold text-sm mb-2 text-green-700">✓ YES</div>
                  <div className="text-xs">High-stakes decision, Legal requirement, Human oversight needed</div>
                  <div className="mt-2 text-xs bg-yellow-100 p-2 rounded">
                    → Add SHAP/LIME layer
                  </div>
                </div>
                <div className="bg-white rounded p-3">
                  <div className="font-bold text-sm mb-2 text-red-700">✗ NO</div>
                  <div className="text-xs">Low-risk, Automated response, Real-time required</div>
                  <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                    → Direct action
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-lg font-bold mb-4 text-center">Method Selection Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Scenario</th>
                  <th className="p-2 text-left">Data Type</th>
                  <th className="p-2 text-left">Recommended Method</th>
                  <th className="p-2 text-left">Key Logic</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Predict attack location</td>
                  <td className="p-2">Historical events</td>
                  <td className="p-2 font-semibold">XGBoost + PSO</td>
                  <td className="p-2">Spatial-temporal patterns</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-2">Detect hate speech</td>
                  <td className="p-2">Text posts</td>
                  <td className="p-2 font-semibold">BERT + BiLSTM</td>
                  <td className="p-2">Contextual semantics</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Network intrusion</td>
                  <td className="p-2">Traffic logs</td>
                  <td className="p-2 font-semibold">LSTM-Autoencoder</td>
                  <td className="p-2">Anomaly from normal</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-2">Map terror network</td>
                  <td className="p-2">Relationships</td>
                  <td className="p-2 font-semibold">GNN + Centrality</td>
                  <td className="p-2">Graph structure analysis</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Verify fake news</td>
                  <td className="p-2">Articles + metadata</td>
                  <td className="p-2 font-semibold">FakeBERT + HITL</td>
                  <td className="p-2">Semantic + human check</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const ArchitectureDiagram = () => (
    <div className="w-full h-full p-6 bg-gradient-to-br from-indigo-50 to-blue-50 overflow-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-indigo-900">System Architecture and Data Flow</h2>
      
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-blue-600">
          <div className="flex items-center mb-3">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">1</div>
            <h3 className="text-lg font-bold text-blue-900">Data Collection Layer</h3>
          </div>
          <div className="grid grid-cols-6 gap-2">
            <div className="bg-blue-50 p-3 rounded text-center text-xs">
              <Database className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <div className="font-semibold">OSINT</div>
              <div className="text-gray-600">Social Media</div>
            </div>
            <div className="bg-blue-50 p-3 rounded text-center text-xs">
              <Network className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <div className="font-semibold">SIGINT</div>
              <div className="text-gray-600">Signals</div>
            </div>
            <div className="bg-blue-50 p-3 rounded text-center text-xs">
              <Users className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <div className="font-semibold">HUMINT</div>
              <div className="text-gray-600">Human Intel</div>
            </div>
            <div className="bg-blue-50 p-3 rounded text-center text-xs">
              <Eye className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <div className="font-semibold">IMINT</div>
              <div className="text-gray-600">Imagery</div>
            </div>
            <div className="bg-blue-50 p-3 rounded text-center text-xs">
              <Users className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <div className="font-semibold">Crosint</div>
              <div className="text-gray-600">Crowdsource</div>
            </div>
            <div className="bg-blue-50 p-3 rounded text-center text-xs">
              <Database className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <div className="font-semibold">IoT</div>
              <div className="text-gray-600">Sensors</div>
            </div>
          </div>
        </div>

        <div className="text-center text-3xl text-gray-400">↓</div>

        <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-purple-600">
          <div className="flex items-center mb-3">
            <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">2</div>
            <h3 className="text-lg font-bold text-purple-900">Data Fusion and Preprocessing</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-purple-50 p-3 rounded text-xs">
              <div className="font-bold mb-2">Cleaning</div>
              <div>• Remove noise</div>
              <div>• Handle missing</div>
              <div>• Normalize</div>
            </div>
            <div className="bg-purple-50 p-3 rounded text-xs">
              <div className="font-bold mb-2">Integration</div>
              <div>• MSDF</div>
              <div>• Timestamp align</div>
              <div>• Entity matching</div>
            </div>
            <div className="bg-purple-50 p-3 rounded text-xs">
              <div className="font-bold mb-2">Feature Extract</div>
              <div>• NLP embeddings</div>
              <div>• Image features</div>
              <div>• Graph metrics</div>
            </div>
            <div className="bg-purple-50 p-3 rounded text-xs">
              <div className="font-bold mb-2">Verification</div>
              <div>• Cross-reference</div>
              <div>• Reliability score</div>
              <div>• Bias detection</div>
            </div>
          </div>
        </div>

        <div className="text-center text-3xl text-gray-400">↓</div>

        <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-green-600">
          <div className="flex items-center mb-3">
            <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">3</div>
            <h3 className="text-lg font-bold text-green-900">AI Processing and Analysis</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 p-3 rounded">
              <div className="font-bold text-sm mb-2 text-green-800">Predictive Models</div>
              <div className="space-y-1 text-xs">
                <div className="bg-white p-2 rounded">XGBoost: Attack prediction</div>
                <div className="bg-white p-2 rounded">LSTM: Sequence analysis</div>
                <div className="bg-white p-2 rounded">Random Forest: Risk scoring</div>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-bold text-sm mb-2 text-green-800">Detection Models</div>
              <div className="space-y-1 text-xs">
                <div className="bg-white p-2 rounded">BERT: Text classification</div>
                <div className="bg-white p-2 rounded">CNN: Image analysis</div>
                <div className="bg-white p-2 rounded">Autoencoder: Anomalies</div>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-bold text-sm mb-2 text-green-800">Network Analysis</div>
              <div className="space-y-1 text-xs">
                <div className="bg-white p-2 rounded">GNN: Relationship map</div>
                <div className="bg-white p-2 rounded">STGCN: Spread predict</div>
                <div className="bg-white p-2 rounded">Centrality: Key nodes</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-3xl text-gray-400">↓</div>

        <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-yellow-600">
          <div className="flex items-center mb-3">
            <div className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">4</div>
            <h3 className="text-lg font-bold text-yellow-900">Explainability and Validation</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-yellow-50 p-3 rounded text-xs">
              <div className="font-bold mb-2">SHAP</div>
              <div>Feature importance scores</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded text-xs">
              <div className="font-bold mb-2">LIME</div>
              <div>Local interpretability</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded text-xs">
              <div className="font-bold mb-2">Human Review</div>
              <div>Analyst validation</div>
            </div>
          </div>
        </div>

        <div className="text-center text-3xl text-gray-400">↓</div>

        <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-red-600">
          <div className="flex items-center mb-3">
            <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">5</div>
            <h3 className="text-lg font-bold text-red-900">Decision and Action Layer</h3>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-red-50 p-3 rounded text-center text-xs">
              <Shield className="w-6 h-6 mx-auto mb-1 text-red-600" />
              <div className="font-semibold">Alert</div>
              <div className="text-gray-600">Notify analysts</div>
            </div>
            <div className="bg-red-50 p-3 rounded text-center text-xs">
              <Lock className="w-6 h-6 mx-auto mb-1 text-red-600" />
              <div className="font-semibold">Block</div>
              <div className="text-gray-600">Prevent intrusion</div>
            </div>
            <div className="bg-red-50 p-3 rounded text-center text-xs">
              <Network className="w-6 h-6 mx-auto mb-1 text-red-600" />
              <div className="font-semibold">Disrupt</div>
              <div className="text-gray-600">Fragment network</div>
            </div>
            <div className="bg-red-50 p-3 rounded text-center text-xs">
              <Users className="w-6 h-6 mx-auto mb-1 text-red-600" />
              <div className="font-semibold">Investigate</div>
              <div className="text-gray-600">Deep analysis</div>
            </div>
            <div className="bg-red-50 p-3 rounded text-center text-xs">
              <TrendingUp className="w-6 h-6 mx-auto mb-1 text-red-600" />
              <div className="font-semibold">Update</div>
              <div className="text-gray-600">Retrain model</div>
            </div>
          </div>
        </div>

        <div className="mt-4 border-4 border-dashed border-indigo-400 rounded-lg p-4 bg-indigo-50">
          <div className="text-center font-bold text-indigo-900 mb-2">
            CONTINUOUS FEEDBACK LOOP
          </div>
          <div className="text-xs text-center text-indigo-700">
            Results feed back to improve models • Human corrections update training data • New threats trigger retraining
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2">
          AI in Counter-Terrorism and Cybersecurity
        </h1>
        <p className="text-center text-indigo-200 text-sm">
          Comprehensive Framework: Methods, Logic and Architecture
        </p>
      </div>

      <div className="bg-white shadow-md">
        <div className="flex justify-center space-x-2 p-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Framework Overview
          </button>
          <button
            onClick={() => setActiveTab('methodology')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'methodology'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Methods and Logic
          </button>
          <button
            onClick={() => setActiveTab('decision')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'decision'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Decision Flow
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'architecture'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            System Architecture
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && <OverviewDiagram />}
        {activeTab === 'methodology' && <MethodologyDiagram />}
        {activeTab === 'decision' && <DecisionFlowDiagram />}
        {activeTab === 'architecture' && <ArchitectureDiagram />}
      </div>

      <div className="bg-gray-800 text-white p-3 text-center text-xs">
        <p>Based on: A Comprehensive Survey on AI in Counter-Terrorism and Cybersecurity (IEEE Access 2025)</p>
      </div>
    </div>
  );
};

export default AISecurityDiagrams;